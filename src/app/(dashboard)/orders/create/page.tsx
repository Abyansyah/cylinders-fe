'use client';

import type React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Package, AlertCircle, CheckCircle, ShoppingCart, User, MapPin, FileText, Minus, X, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTransition } from '@/components/page-transition';
import { UNITS } from '@/constants/order';
import type { CreateOrderRequest } from '@/types/order';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useSWR from 'swr';
import { toast } from 'sonner';
import { getCustomers } from '@/services/customerService';
import { getWarehouses } from '@/services/warehouseService';
import { getProductsByWarehouse, createOrder } from '@/services/orderService';
import { useDebounce } from '@/hooks/use-debounce';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { Warehouse } from '@/types/user';

interface OrderItem {
  product_id: number;
  quantity: number;
  unit: 'btl' | 'pcs' | 'unit' | 'lot';
  is_rental: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Omit<CreateOrderRequest, 'items'>>({
    customer_id: 0,
    assigned_warehouse_id: 0,
    order_type: 'Sewa',
    notes_customer: '',
  });
  const [items, setItems] = useState<OrderItem[]>([{ product_id: 0, quantity: 1, unit: 'btl', is_rental: true }]);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [openWarehouse, setOpenWarehouse] = useState(false);
  const [openProduct, setOpenProduct] = useState<number | null>(null);

  const [customerSearch, setCustomerSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const debouncedWarehouseSearch = useDebounce(warehouseSearch, 300);
  const debouncedProductSearch = useDebounce(productSearch, 300);

  const { data: customersResponse, isLoading: isLoadingCustomers } = useSWR(`/customers?search=${debouncedCustomerSearch}&limit=20`, () => getCustomers({ search: debouncedCustomerSearch, limit: 20 }));
  const { data: warehousesResponse, isLoading: isLoadingWarehouses } = useSWR(`/warehouses?search=${debouncedWarehouseSearch}&limit=20`, () => getWarehouses({ search: debouncedWarehouseSearch, limit: 20 }));
  const { data: productsResponse, isLoading: isLoadingProducts } = useSWR(formData.assigned_warehouse_id > 0 ? `/products?warehouse_id=${formData.assigned_warehouse_id}&search=${debouncedProductSearch}` : null, () =>
    getProductsByWarehouse(formData.assigned_warehouse_id)
  );

  const customers = customersResponse?.data ?? [];
  const warehouses = warehousesResponse?.data ?? [];
  const products = productsResponse?.data ?? [];

  const addItem = () => {
    setItems([...items, { product_id: 0, quantity: 1, unit: 'btl', is_rental: formData.order_type === 'Sewa' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];

    if (field === 'product_id') {
      const existingItemIndex = newItems.findIndex((item, i) => i !== index && item.product_id === value);

      if (existingItemIndex !== -1) {
        const product = getSelectedProduct(value);
        const stock = product?.available_stock;

        const currentItemQuantity = newItems[index].quantity;
        const newTotalQuantity = newItems[existingItemIndex].quantity + currentItemQuantity;

        if (stock !== undefined && newTotalQuantity > stock) {
          newItems[existingItemIndex].quantity = stock;
          toast.warning('Kuantitas melebihi stok.', {
            description: `Jumlah produk disesuaikan menjadi ${stock} sesuai stok yang tersedia.`,
          });
        } else {
          newItems[existingItemIndex].quantity = newTotalQuantity;
          toast.info('Produk sudah ada.', {
            description: `Kuantitas telah ditambahkan ke item yang ada.`,
          });
        }

        const filteredItems = newItems.filter((_, i) => i !== index);
        setItems(filteredItems);
        return;
      }
    }

    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateQuantity = (index: number, increment: boolean) => {
    const newItems = [...items];
    const currentQty = newItems[index].quantity;
    newItems[index].quantity = increment ? currentQty + 1 : Math.max(1, currentQty - 1);
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, value: string) => {
    const numValue = Number.parseInt(value) || 1;
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, numValue);
    setItems(newItems);
  };
  const getSelectedProduct = (productId: number) => products.find((p: Product) => p.id === productId);
  const getSelectedCustomer = () => customers.find((c: Customer) => c.id === formData.customer_id);
  const getSelectedWarehouse = () => warehouses.find((w: Warehouse) => w.id === formData.assigned_warehouse_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const finalItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      is_rental: formData.order_type === 'Sewa',
      unit: item.unit,
    }));

    const orderData: CreateOrderRequest = { ...formData, items: finalItems };

    try {
      await createOrder(orderData);
      toast.success('Order berhasil dibuat!');
      router.push('/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = () => formData.customer_id > 0 && formData.assigned_warehouse_id > 0;
  const isFormValid = () => isStep1Valid() && items.every((item) => item.product_id > 0 && item.quantity > 0);

  const isStep2Valid = () => {
    if (items.some((item) => item.product_id === 0)) {
      return false;
    }
    for (const item of items) {
      const product = getSelectedProduct(item.product_id);
      if (product) {
        if (product.available_stock === 0) {
          return false;
        }
        if (item.quantity > product.available_stock) {
          return false;
        }
      }
    }
    return true;
  };

  const isAddProductDisabled = () => {
    return items.some((item) => {
      const product = getSelectedProduct(item.product_id);
      return product && product.available_stock === 0;
    });
  };

  const steps = [
    { number: 1, title: 'Info Order', icon: FileText, color: 'bg-blue-500' },
    { number: 2, title: 'Pilih Produk', icon: Package, color: 'bg-purple-500' },
    { number: 3, title: 'Review', icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="lg:hidden">
                  <Link href="/orders">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Buat Order Baru</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Buat pesanan baru untuk pelanggan</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                <Link href="/orders">
                  <X className="h-4 w-4 mr-2" />
                  Kembali
                </Link>
              </Button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <div className="flex items-center justify-center min-w-max px-4">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                            currentStep >= step.number ? step.color + ' scale-110 shadow-lg' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          {currentStep > step.number ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <span className="mt-1 text-xs sm:text-sm font-medium text-gray-900 dark:text-white text-center">{step.title}</span>
                        {currentStep === step.number && <motion.div layoutId="activeStep" className="mt-1 w-1.5 h-1.5 bg-blue-500 rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                      </div>
                      {index < steps.length - 1 && <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-3 rounded-full transition-colors duration-300 ${currentStep > step.number ? step.color : 'bg-gray-200 dark:bg-gray-700'}`} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                          Informasi Order
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <User className="h-4 w-4 text-blue-600" />
                            Pilih Pelanggan *
                          </Label>
                          <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={openCustomer} className="w-full h-10 justify-between text-left font-normal bg-transparent">
                                {formData.customer_id > 0 ? getSelectedCustomer()?.customer_name : 'Cari dan pilih pelanggan...'}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Cari pelanggan..." value={customerSearch} onValueChange={setCustomerSearch} />
                                <CommandList>
                                  {isLoadingCustomers && <div className="p-2 text-center text-sm">Memuat...</div>}
                                  <CommandEmpty>Pelanggan tidak ditemukan.</CommandEmpty>
                                  <CommandGroup>
                                    {customers.map((customer) => (
                                      <CommandItem
                                        key={customer.id}
                                        value={customer.customer_name}
                                        onSelect={() => {
                                          setFormData((prev) => ({ ...prev, customer_id: customer.id }));
                                          setOpenCustomer(false);
                                        }}
                                      >
                                        <div className="flex items-center gap-3 py-1">
                                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm">{customer.customer_name}</div>
                                            <div className="text-xs text-gray-500">{customer.company_name}</div>
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {getSelectedCustomer() && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {getSelectedCustomer()?.customer_name} - {getSelectedCustomer()?.company_name}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <MapPin className="h-4 w-4 text-green-600" />
                            Pilih Gudang *
                          </Label>
                          <Popover open={openWarehouse} onOpenChange={setOpenWarehouse}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={openWarehouse} className="w-full h-10 justify-between text-left font-normal bg-transparent">
                                {formData.assigned_warehouse_id > 0 ? getSelectedWarehouse()?.name : 'Cari dan pilih gudang...'}
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Cari gudang..." value={warehouseSearch} onValueChange={setWarehouseSearch} />
                                <CommandList>
                                  {isLoadingWarehouses && <div className="p-2 text-center text-sm">Memuat...</div>}
                                  <CommandEmpty>Gudang tidak ditemukan.</CommandEmpty>
                                  <CommandGroup>
                                    {warehouses.map((warehouse) => (
                                      <CommandItem
                                        key={warehouse.id}
                                        value={warehouse.name}
                                        onSelect={() => {
                                          setFormData((prev) => ({ ...prev, assigned_warehouse_id: warehouse.id }));
                                          setOpenWarehouse(false);
                                        }}
                                      >
                                        <div className="flex items-center gap-3 py-1">
                                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm">{warehouse.name}</div>
                                            <div className="text-xs text-gray-500">{warehouse.address}</div>
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {getSelectedWarehouse() && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">{getSelectedWarehouse()?.name}</span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <ShoppingCart className="h-4 w-4 text-purple-600" />
                            Tipe Order *
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            {['Sewa', 'Beli'].map((type) => (
                              <motion.button
                                key={type}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, order_type: type as 'Sewa' | 'Beli' }));
                                  setItems((prev) => prev.map((item) => ({ ...item, is_rental: type === 'Sewa' })));
                                }}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                  formData.order_type === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="font-semibold">{type}</div>
                                  <div className="text-xs text-gray-500 mt-1">{type === 'Sewa' ? 'Penyewaan tabung gas' : 'Pembelian tabung gas'}</div>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Catatan Pelanggan</Label>
                          <Textarea
                            placeholder="Tambahkan catatan khusus dari pelanggan..."
                            value={formData.notes_customer}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes_customer: e.target.value }))}
                            rows={3}
                            className="resize-none text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20">
                      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5" />
                          </div>
                          Pilih Produk
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-6">
                          <AnimatePresence>
                            {items.map((item, index) => {
                              const selectedProduct = getSelectedProduct(item.product_id);

                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 space-y-4 bg-white/50 dark:bg-gray-800/50"
                                >
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">{index + 1}</div>
                                      Item #{index + 1}
                                    </h4>
                                    {items.length > 1 && (
                                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <Label className="text-sm font-semibold">Pilih Produk *</Label>
                                    <Popover open={openProduct === index} onOpenChange={(open) => setOpenProduct(open ? index : null)}>
                                      <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={openProduct === index} className="w-full h-10 justify-between text-left font-normal bg-transparent">
                                          {item.product_id > 0 ? getSelectedProduct(item.product_id)?.name : 'Cari dan pilih produk...'}
                                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Cari produk..." value={productSearch} onValueChange={setProductSearch} />
                                          <CommandList>
                                            {isLoadingProducts && <div className="p-2 text-center text-sm">Memuat...</div>}
                                            <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                              {products.map((product: Product) => (
                                                <CommandItem
                                                  key={product.id}
                                                  value={product.name}
                                                  onSelect={() => {
                                                    updateItem(index, 'product_id', product.id);
                                                    setOpenProduct(null);
                                                  }}
                                                >
                                                  <div className="flex items-center gap-3 py-1">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                                                      <Package className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                      <div className="font-medium text-sm">{product.name}</div>
                                                      <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                                                    </div>
                                                  </div>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  </div>

                                  {selectedProduct && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-100 dark:border-blue-800">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                                          <Package className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                          <h5 className="font-bold text-sm">{selectedProduct.name}</h5>
                                          <p className="text-xs text-gray-500">SKU: {selectedProduct.sku}</p>
                                        </div>
                                      </div>

                                      <Alert className={selectedProduct.available_stock > 0 ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
                                        <Package className="h-4 w-4" />
                                        <AlertDescription>
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">Stok tersedia di gudang:</span>
                                            <Badge variant={selectedProduct.available_stock > 0 ? 'default' : 'destructive'} className="text-xs px-2 py-0.5">
                                              Stok: {selectedProduct.available_stock}
                                            </Badge>
                                          </div>
                                        </AlertDescription>
                                      </Alert>
                                    </motion.div>
                                  )}

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold">Quantity *</Label>
                                      <div className="flex items-center gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(index, false)} disabled={item.quantity <= 1 || selectedProduct?.available_stock === 0} className="w-8 h-8 p-0">
                                          <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={selectedProduct?.available_stock === 0 ? 1 : item.quantity}
                                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                                          className="text-center h-8 font-semibold text-sm"
                                          disabled={selectedProduct?.available_stock === 0}
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(index, true)} className="w-8 h-8 p-0" disabled={selectedProduct?.available_stock === 0}>
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      {selectedProduct?.available_stock !== undefined && item.quantity > selectedProduct.available_stock && (
                                        <Alert variant="destructive">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertDescription className="text-xs">Quantity melebihi stok ({selectedProduct.available_stock})</AlertDescription>
                                        </Alert>
                                      )}
                                    </div>

                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold">Unit *</Label>
                                      <Select value={item.unit} onValueChange={(value: any) => updateItem(index, 'unit', value)}>
                                        <SelectTrigger className="h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {UNITS.map((unit) => (
                                            <SelectItem key={unit} value={unit} className="text-sm">
                                              {unit}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="flex justify-center">
                                    <Badge variant={item.is_rental ? 'default' : 'secondary'} className="px-3 py-1 text-xs">
                                      {item.is_rental ? '🏠 Rental' : '💰 Pembelian'}
                                    </Badge>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </AnimatePresence>

                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center pt-4">
                            <Button
                              type="button"
                              onClick={addItem}
                              variant="outline"
                              size="sm"
                              disabled={isAddProductDisabled()}
                              className="gap-2 px-6 py-2 text-sm border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                            >
                              <Plus className="h-4 w-4" />
                              Tambah Item Baru
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="step3" variants={itemVariants} initial="hidden" animate="visible" exit="hidden">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          Review Order
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Informasi Order</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pelanggan:</span>
                                <span className="font-semibold text-sm">{getSelectedCustomer()?.customer_name}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Perusahaan:</span>
                                <span className="font-semibold text-sm">{getSelectedCustomer()?.company_name}</span>
                              </div>
                              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Gudang:</span>
                                <span className="font-semibold text-sm">{getSelectedWarehouse()?.name}</span>
                              </div>
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tipe Order:</span>
                                <Badge variant={formData.order_type === 'Sewa' ? 'default' : 'secondary'} className="px-3 py-1 text-xs">
                                  {formData.order_type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Items ({items.length})</h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {items.map((item, index) => {
                                const product = getSelectedProduct(item.product_id);
                                return (
                                  <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                      <Package className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-sm">{product?.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {item.quantity} {item.unit}
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {formData.notes_customer && (
                          <div className="space-y-3">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Catatan Pelanggan</h3>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm leading-relaxed">{formData.notes_customer}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-6">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep - 1);
                      }}
                      className="gap-2 px-4 py-2"
                      size="sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="ghost" asChild size="sm">
                    <Link href="/orders">Batal</Link>
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep + 1);
                      }}
                      disabled={(currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())}
                      className="gap-2 px-6 py-2"
                      size="sm"
                    >
                      Selanjutnya
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!isFormValid() || isSubmitting} className="gap-2 px-6 py-2" size="sm">
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Buat Order
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
