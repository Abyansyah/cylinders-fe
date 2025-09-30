'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Scan, Package, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PICKUP_TYPES, CYLINDER_STATUSES } from '@/constants/advanced-return';
import type { AdvancedReturnItem } from '@/types/advanced-return';
import { createAdvancedReturn } from '@/services/advancedReturnService';
import { Combobox } from '../../cylinders/components/cylinder-form-create';
import useSWR from 'swr';
import { getCustomersSelectList, getWarehousesSelectList } from '@/services/SearchListService';
import { useDebounce } from '@/hooks/use-debounce';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { BarcodeScanner } from '@/components/features/barcode-scanner';

export default function CreateAdvancedReturnForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [pickupType, setPickupType] = useState<'COMPLAIN_CLAIM' | 'RETURN_UNUSED' | ''>('');
  const [notes, setNotes] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const [items, setItems] = useState<AdvancedReturnItem[]>([]);
  const [currentIdentifier, setCurrentIdentifier] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentReason, setCurrentReason] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const debouncedWarehouseSearch = useDebounce(warehouseSearch, 300);

  const { data: customersResponse, isLoading: isLoadingCustomers } = useSWR(`/select-lists/customers?search=${debouncedCustomerSearch}`, () => getCustomersSelectList({ search: debouncedCustomerSearch, relation_type: 'CLIENT' }));
  const { data: warehousesResponse, isLoading: isLoadingWarehouses } = useSWR(`/select-lists/warehouses?search=${debouncedCustomerSearch}`, () => getWarehousesSelectList({ search: debouncedWarehouseSearch }));

  const handleAddItem = () => {
    if (!currentIdentifier.trim()) {
      toast.error('Identifier tidak boleh kosong');
      return;
    }

    if (!currentReason.trim()) {
      toast.error('Alasan tidak boleh kosong');
      return;
    }

    if (pickupType === 'COMPLAIN_CLAIM' && !currentStatus) {
      toast.error('Status harus dipilih untuk tipe Komplain/Claim');
      return;
    }

    if (items.some((item) => item.identifier === currentIdentifier.trim())) {
      toast.error('Identifier sudah ada dalam daftar');
      return;
    }

    const newItem: AdvancedReturnItem = {
      identifier: currentIdentifier.trim(),
      reason: currentReason.trim(),
      ...(pickupType === 'COMPLAIN_CLAIM' && { status: currentStatus }),
    };

    setItems([...items, newItem]);
    setCurrentIdentifier('');
    setCurrentStatus('');
    setCurrentReason('');
    toast.success('Item berhasil ditambahkan');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success('Item berhasil dihapus');
  };

  const handleSubmit = async () => {
    if (!customerId || !warehouseId || !pickupType || !notes.trim() || items.length === 0) {
      toast.error('Semua field harus diisi dan minimal ada 1 item');
      return;
    }

    setIsLoading(true);

    try {
      const requestData: any = {
        customer_id: customerId,
        warehouse_id: warehouseId,
        return_date: format(returnDate!, 'yyyy-MM-dd'),
        pickup_type: pickupType as 'COMPLAIN_CLAIM' | 'RETURN_UNUSED',
        notes: notes.trim(),
        items,
      };

      const response = await createAdvancedReturn(requestData);

      toast.success(response.message);
      router.push('/advanced-return');
    } catch (error) {
      toast.error('Gagal membuat advanced return');
      setIsLoading(false);
    }
  };

  const handleScanBarcode = (barcode: string) => {
    setShowScanner(false);
    setCurrentIdentifier(barcode);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/advanced-return">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buat Pickup Baru</h1>
            <p className="text-muted-foreground">Buat pickup tabung baru dari pelanggan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer">Pelanggan *</Label>

                      <Combobox
                        options={customersResponse?.data.map((g: any) => ({ value: g.value, label: g.label })) || []}
                        value={customerId}
                        onValueChange={setCustomerId}
                        valueSearch={customerSearch}
                        setValueSearch={setCustomerSearch}
                        placeholder="Pilih customer..."
                        searchPlaceholder="Cari customer..."
                        emptyText="Customer tidak ditemukan."
                        isLoading={isLoadingCustomers}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouse">Gudang *</Label>
                      <Combobox
                        options={warehousesResponse?.data.map((g: any) => ({ value: g.value, label: g.label })) || []}
                        value={warehouseId}
                        onValueChange={setWarehouseId}
                        valueSearch={warehouseSearch}
                        setValueSearch={setWarehouseSearch}
                        placeholder="Pilih gudang..."
                        searchPlaceholder="Cari gudang..."
                        emptyText="Gudang tidak ditemukan."
                        isLoading={isLoadingWarehouses}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <DatePicker label="Tanggal Kembali" date={returnDate} setDate={setReturnDate} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup_type">Tipe Pickup *</Label>
                      <Select value={pickupType} onValueChange={(value) => setPickupType(value as 'COMPLAIN_CLAIM' | 'RETURN_UNUSED')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe pickup" />
                        </SelectTrigger>
                        <SelectContent>
                          {PICKUP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan *</Label>
                    <Textarea id="notes" placeholder="Masukkan catatan return..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5" />
                    Tambah Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">Barcode/Serial Number *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="identifier"
                          placeholder="Scan atau ketik barcode/serial number..."
                          value={currentIdentifier}
                          onChange={(e) => setCurrentIdentifier(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddItem();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={() => setShowScanner(true)} type="button" variant="outline" size="icon">
                          <Scan className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {pickupType === 'COMPLAIN_CLAIM' && (
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select value={currentStatus} onValueChange={setCurrentStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status tabung" />
                          </SelectTrigger>
                          <SelectContent>
                            {CYLINDER_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reason">Alasan *</Label>
                      <Input id="reason" placeholder="Masukkan alasan return..." value={currentReason} onChange={(e) => setCurrentReason(e.target.value)} />
                    </div>

                    <Button type="button" onClick={handleAddItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {items.length > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Daftar Item ({items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {items.map((item, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.identifier}</div>
                            <div className="text-sm text-muted-foreground">{item.reason}</div>
                            {item.status && (
                              <Badge variant="outline" className="mt-1">
                                {item.status}
                              </Badge>
                            )}
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                    <div className="text-sm text-blue-600">Total Item</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{pickupType === 'COMPLAIN_CLAIM' ? items.filter((item) => item.status).length : items.length}</div>
                    <div className="text-sm text-green-600">Valid Item</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tipe:</span>
                    <span className="font-medium">{pickupType ? PICKUP_TYPES.find((t) => t.value === pickupType)?.label : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span className="font-medium">{returnDate ? format(returnDate, 'dd-MM-yyyy') : '-'}</span>
                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={isLoading || !customerId || !warehouseId || !pickupType || !notes.trim() || items.length === 0} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Buat Return
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Informasi:</p>
                    <ul className="space-y-1">
                      <li>• Untuk tipe Komplain/Claim, status tabung wajib diisi</li>
                      <li>• Untuk tipe Return Tidak Terpakai, hanya perlu identifier dan alasan</li>
                      <li>• Pastikan barcode/serial number sudah benar</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
      {showScanner && <BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleScanBarcode} />}
    </div>
  );
}
