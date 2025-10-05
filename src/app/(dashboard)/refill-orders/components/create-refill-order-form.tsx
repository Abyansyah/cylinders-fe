'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Package, Building2, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BarcodeScanner } from '@/components/features/barcode-scanner';
import { DatePicker } from '@/components/ui/date-picker';
import { createRefillOrder } from '@/services/refillOrderService';
import type { CreateRefillOrderRequest } from '@/types/refill-order';
import { getCustomersSelectList, getProductsSelect } from '@/services/SearchListService';
import { useDebounce } from '@/hooks/use-debounce';
import { Combobox } from '@/components/combobox';

interface OrderItem {
  product_id: number;
  product_name: string;
  product_sku: string;
  identifiers: string[];
}

export default function CreateRefillOrderForm() {
  const router = useRouter();

  const [supplierId, setSupplierId] = useState<any>('');
  const [dispatchDate, setDispatchDate] = useState<Date | undefined>(new Date());
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [identifierInput, setIdentifierInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  const { data: customersResponse, isLoading: isLoadingCustomers } = useSWR(`/select-lists/customers?search=${debouncedCustomerSearch}`, () => getCustomersSelectList({ search: debouncedCustomerSearch, relation_type: 'SUPPLIER' }));
  const { data: productsResponse } = useSWR('/select-lists/products', getProductsSelect);

  const products: any[] = productsResponse?.data || [];

  const handleBarcodeDetected = (barcode: string) => {
    setIdentifierInput(barcode);
    setShowScanner(false);
  };

  const handleAddItem = () => {
    if (!selectedProductId || !identifierInput.trim()) {
      toast.error('Mohon lengkapi produk dan barcode/serial number.');
      return;
    }

    const product = products.find((p) => p.value.toString() === selectedProductId);
    if (!product) return;

    const identifier = identifierInput.trim();

    const isIdentifierExist = selectedItems.some((item) => item.identifiers.includes(identifier));
    if (isIdentifierExist) {
      toast.error('Identifier sudah ada di dalam daftar.');
      return;
    }

    setSelectedItems((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.product_id === product.value);

      if (existingItemIndex >= 0) {
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].identifiers.push(identifier);
        return updatedItems;
      } else {
        return [
          ...prev,
          {
            product_id: product.value,
            product_name: product.label,
            product_sku: '',
            identifiers: [identifier],
          },
        ];
      }
    });

    setIdentifierInput('');
    toast.success(`"${identifier}" ditambahkan ke produk "${product.name}".`);
  };

  const handleRemoveIdentifier = (productId: number, identifier: string) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            return {
              ...item,
              identifiers: item.identifiers.filter((id) => id !== identifier),
            };
          }
          return item;
        })
        .filter((item) => item.identifiers.length > 0)
    );
  };

  const handleSubmit = async () => {
    if (!supplierId || !dispatchDate || selectedItems.length === 0) {
      toast.error('Mohon lengkapi supplier, tanggal kirim, dan tambahkan minimal satu item.');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateRefillOrderRequest = {
        supplier_id: Number.parseInt(supplierId),
        dispatch_date: format(dispatchDate, 'yyyy-MM-dd'),
        items: selectedItems.map((item) => ({
          product_id: item.product_id,
          identifiers: item.identifiers,
        })),
      };

      await createRefillOrder(request);

      toast.success('Order refill berhasil dibuat!');
      router.push('/refill-orders');
    } catch (error: any) {
      toast.error('Gagal membuat order refill', {
        description: error?.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalIdentifiers = () => {
    return selectedItems.reduce((total, item) => total + item.identifiers.length, 0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/refill-orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buat Order Refill</h1>
            <p className="text-muted-foreground">Buat pesanan refill tabung gas baru</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Combobox
                      options={customersResponse?.data.map((g: any) => ({ value: g.value, label: g.label })) || []}
                      value={supplierId}
                      onValueChange={setSupplierId}
                      valueSearch={customerSearch}
                      setValueSearch={setCustomerSearch}
                      placeholder="Pilih supplier..."
                      searchPlaceholder="Cari supplier..."
                      emptyText="Customer tidak ditemukan."
                      isLoading={isLoadingCustomers}
                    />
                  </div>

                  <div className="space-y-2">
                    <DatePicker label="Tanggal Kirim" date={dispatchDate} setDate={setDispatchDate} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tambah Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Produk *</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.value} value={product.value.toString()}>
                            {product.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Barcode / Serial Number *</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Masukkan barcode atau serial number..." value={identifierInput} onChange={(e) => setIdentifierInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddItem()} className="pl-9" />
                      </div>
                      <Button variant="outline" onClick={() => setShowScanner(true)}>
                        Scan
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleAddItem} disabled={!selectedProductId || !identifierInput.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Item
                </Button>

                {selectedItems.length > 0 && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedItems.map((item, itemIndex) => (
                      <motion.div key={item.product_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: itemIndex * 0.1 }} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-muted-foreground">{item.product_sku}</p>
                          </div>
                          <Badge variant="outline">{item.identifiers.length} item</Badge>
                        </div>

                        <div className="space-y-2">
                          {item.identifiers.map((identifier, identifierIndex) => (
                            <motion.div
                              key={identifier}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: identifierIndex * 0.05 }}
                              className="flex items-center justify-between p-2 bg-white rounded border"
                            >
                              <span className="font-mono text-sm">{identifier}</span>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveIdentifier(item.product_id, identifier)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {selectedItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada item yang dipilih</p>
                    <p className="text-sm">Pilih produk dan masukkan barcode/serial number</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Produk:</span>
                    <span className="font-medium">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Item:</span>
                    <span className="font-medium">{getTotalIdentifiers()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tanggal Kirim:</span>
                    <span className="font-medium">{dispatchDate ? format(dispatchDate, 'dd MMMM yyyy') : '-'}</span>
                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={isSubmitting || !supplierId || selectedItems.length === 0} className="w-full">
                  {isSubmitting ? 'Membuat Order...' : 'Buat Order Refill'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showScanner && <BarcodeScanner onScan={handleBarcodeDetected} onClose={() => setShowScanner(false)} />}
      </motion.div>
    </div>
  );
}
