'use client';

import type React from 'react';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CreateTTBKRequest } from '@/types/ttbk';
import { createTTBK } from '@/services/ttbkService';
import { BarcodeScanner } from '@/components/features/barcode-scanner';
import { CustomerSearchCombobox } from '../../loan-adjustments/components/customer-search-combobox';
import { WarehouseSearchCombobox } from '../../loan-adjustments/components/warehouse-search-combobox';

export default function CreateTTBKForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateTTBKRequest>>({
    customer_id: undefined,
    destination_warehouse_id: undefined,
    receipt_date: '',
    ttbk_number: '',
    notes: '',
    barcodes: [],
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [newBarcode, setNewBarcode] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const addBarcode = (barcodeToAdd?: string) => {
    const barcode = (barcodeToAdd || newBarcode).trim();
    if (!barcode) {
      toast.error('Barcode tidak boleh kosong');
      return;
    }

    if (formData.barcodes?.includes(barcode)) {
      toast.error('Barcode sudah ada');
      return;
    }

    setFormData({
      ...formData,
      barcodes: [...(formData.barcodes || []), barcode],
    });
    setNewBarcode('');
    toast.success('Barcode berhasil ditambahkan');
  };

  const removeBarcode = (barcode: string) => {
    setFormData({
      ...formData,
      barcodes: formData.barcodes?.filter((b) => b !== barcode) || [],
    });
    toast.success('Barcode berhasil dihapus');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.destination_warehouse_id || !formData.receipt_date || !formData.ttbk_number) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (!formData.barcodes || formData.barcodes.length === 0) {
      toast.error('Minimal harus ada satu barcode');
      return;
    }

    setLoading(true);

    try {
      await createTTBK(formData as CreateTTBKRequest);
      toast.success('TTBK berhasil dibuat');
      router.push('/ttbk');
    } catch (error: any) {
      toast.error('Gagal membuat TTBK', {
        description: error.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData({ ...formData, receipt_date: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBarcode();
    }
  };

  const handleScan = (scannedBarcode: string) => {
    addBarcode(scannedBarcode);
    setIsScannerOpen(false);
  };

  return (
    <div className="container mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Link href="/ttbk">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat TTBK Baru</h1>
          <p className="text-gray-600">Tanda Terima Barang Kosong</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi TTBK</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <CustomerSearchCombobox value={formData.customer_id?.toString() || ''} onChange={(value) => setFormData({ ...formData, customer_id: value ? parseInt(value, 10) : undefined })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">Gudang Tujuan *</Label>
                  <WarehouseSearchCombobox value={formData.destination_warehouse_id?.toString() || ''} onChange={(value) => setFormData({ ...formData, destination_warehouse_id: value ? parseInt(value, 10) : undefined })} />
                </div>

                <div className="space-y-2">
                  <Label>Tanggal Terima *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: id }) : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ttbk_number">Nomor TTBK *</Label>
                  <Input
                    id="ttbk_number"
                    value={formData.ttbk_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').toUpperCase();
                      setFormData({ ...formData, ttbk_number: value });
                    }}
                    placeholder="Masukkan nomor TTBK"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Catatan tambahan..." rows={3} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Barcode Tabung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} onKeyPress={handleBarcodeKeyPress} placeholder="Scan atau ketik barcode" className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                    <Scan className="w-4 h-4" />
                  </Button>
                  <Button type="button" onClick={() => addBarcode()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {formData.barcodes && formData.barcodes.length > 0 ? (
                    formData.barcodes.map((barcode, index) => (
                      <motion.div
                        key={barcode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <span className="font-mono text-sm">{barcode}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeBarcode(barcode)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Scan className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>Belum ada barcode yang ditambahkan</p>
                    </div>
                  )}
                </div>

                {formData.barcodes && formData.barcodes.length > 0 && <div className="text-sm text-gray-600 text-center">Total: {formData.barcodes.length} tabung</div>}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="sticky bottom-1 mt-3">
          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? 'Membuat TTBK...' : 'Buat TTBK'}
          </Button>
        </motion.div>
      </form>
      {isScannerOpen && <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />}
    </div>
  );
}
