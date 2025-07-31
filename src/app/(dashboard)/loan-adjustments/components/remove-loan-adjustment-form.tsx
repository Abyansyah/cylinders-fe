'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmationDialog } from './confirmation-dialog';
import { ArrowLeft, UserMinus, Minus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CustomerSearchCombobox } from './customer-search-combobox';
import { Customer } from '@/types/customer';
import { WarehouseSearchCombobox } from './warehouse-search-combobox';
import { Warehouse } from '@/types/warehouse';
import { removeLoanAdjustment } from '@/services/loanAdjustmentService';
import { format } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const RETURN_CONDITIONS = [
  { value: 'FULL', label: 'Full', color: 'bg-green-100 text-green-800' },
  { value: 'EMPTY', label: 'Empty', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PARTIAL', label: 'Partial', color: 'bg-orange-100 text-orange-800' },
];

interface BarcodeItem {
  barcode_id: string;
  return_condition: 'FULL' | 'EMPTY' | 'PARTIAL';
}

interface FormData {
  customer_id: string;
  adjustment_date: Date | undefined;
  notes: string;
  warehouse_id: string;
  items: BarcodeItem[];
}

export default function RemoveLoanAdjustmentForm() {
  const router = useRouter();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<'FULL' | 'EMPTY' | 'PARTIAL'>('FULL');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customer_id: '',
    adjustment_date: undefined,
    notes: '',
    warehouse_id: '',
    items: [],
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const handleAddBarcode = () => {
    if (barcodeInput.trim() && !formData.items.some((item) => item.barcode_id === barcodeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            barcode_id: barcodeInput.trim(),
            return_condition: selectedCondition,
          },
        ],
      }));
      setBarcodeInput('');
    }
  };

  const handleRemoveBarcode = (barcodeId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.barcode_id !== barcodeId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const requestBody = {
        customer_id: Number.parseInt(formData.customer_id),
        adjustment_date: format(formData.adjustment_date!, 'yyyy-MM-dd'),
        notes: formData.notes,
        warehouse_id: Number.parseInt(formData.warehouse_id),
        items: formData.items,
      };

      await removeLoanAdjustment(requestBody);
      toast.success('Relasi berhasil dihapus!');
      router.push('/loan-adjustments');
    } catch (error: any) {
      toast.error('Gagal menghapus relasi', {
        description: error.response?.data?.message,
      });
      throw error;
    }
  };

  return (
    <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <UserMinus className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hapus Relasi</h1>
        </div>
        <p className="text-muted-foreground">Hapus pinjaman tabung dari relasi bisnis</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-red-600" />
              Form Hapus Relasi
            </CardTitle>
            <CardDescription>Isi form di bawah untuk menghapus pinjaman tabung</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <CustomerSearchCombobox value={formData.customer_id} onChange={(value) => setFormData((prev) => ({ ...prev, customer_id: value }))} selectedData={(value) => setSelectedCustomer(value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse *</Label>
                  <WarehouseSearchCombobox value={formData.warehouse_id} onChange={(val) => setFormData((prev) => ({ ...prev, warehouse_id: val }))} selectedData={(warehouse) => setSelectedWarehouse(warehouse)} />
                </div>
              </div>

              <DatePicker label="Tanggal Penyesuaian *" date={formData.adjustment_date} setDate={(date) => setFormData((prev: any) => ({ ...prev, adjustment_date: date }))} placeholder="Pilih tanggal penyesuaian" id="adjustment_date" />

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan *</Label>
                <Textarea id="notes" placeholder="Masukkan catatan untuk penyesuaian ini..." value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={4} required />
              </div>

              <div className="space-y-4">
                <Label>Barcode Tabung & Kondisi *</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="Masukkan barcode tabung..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBarcode())}
                    className="md:col-span-2"
                  />
                  <Select value={selectedCondition} onValueChange={(value) => setSelectedCondition(value as 'FULL' | 'EMPTY' | 'PARTIAL')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_CONDITIONS.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleAddBarcode} variant="outline" className="w-full md:w-auto bg-transparent">
                  <Minus className="h-4 w-4 mr-2" />
                  Tambah Item
                </Button>

                {formData.items.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Item yang akan dihapus ({formData.items.length})</Label>
                    <div className="space-y-2">
                      {formData.items.map((item) => (
                        <div key={item.barcode_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">{item.barcode_id}</span>
                            <Badge variant="secondary" className={RETURN_CONDITIONS.find((c) => c.value === item.return_condition)?.color}>
                              {RETURN_CONDITIONS.find((c) => c.value === item.return_condition)?.label}
                            </Badge>
                          </div>
                          <button type="button" onClick={() => handleRemoveBarcode(item.barcode_id)} className="text-red-600 hover:text-red-700">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <Button type="submit" disabled={formData.items.length === 0 || !formData.adjustment_date} className="bg-red-600 hover:bg-red-700">
                  Hapus Relasi
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title="Konfirmasi Hapus Relasi"
        description="Apakah Anda yakin ingin menghapus pinjaman tabung dari relasi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmSubmit}
        variant="destructive"
        details={{
          customer: selectedCustomer ? `${selectedCustomer.customer_name} (${selectedCustomer.company_name})` : undefined,
          warehouse: selectedWarehouse ? `${selectedWarehouse.name}` : undefined,
          date: formData.adjustment_date?.toLocaleDateString(),
          itemCount: formData.items.length,
          items: formData.items.map((item) => `${item.barcode_id} (${item.return_condition})`),
          notes: formData.notes,
        }}
      />
    </motion.div>
  );
}
