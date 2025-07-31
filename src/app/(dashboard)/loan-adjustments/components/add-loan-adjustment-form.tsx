'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { ConfirmationDialog } from './confirmation-dialog';
import { ArrowLeft, UserPlus, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CustomerSearchCombobox } from './customer-search-combobox';
import { Customer } from '@/types/customer';
import { addLoanAdjustment } from '@/services/loanAdjustmentService';
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

interface FormData {
  customer_id: string;
  adjustment_date: Date | undefined;
  notes: string;
  barcodes: string[];
}

export default function AddLoanAdjustmentForm() {
  const router = useRouter();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customer_id: '',
    adjustment_date: undefined,
    notes: '',
    barcodes: [],
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAddBarcode = () => {
    if (barcodeInput.trim() && !formData.barcodes.includes(barcodeInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        barcodes: [...prev.barcodes, barcodeInput.trim()],
      }));
      setBarcodeInput('');
    }
  };

  const handleRemoveBarcode = (barcode: string) => {
    setFormData((prev) => ({
      ...prev,
      barcodes: prev.barcodes.filter((b) => b !== barcode),
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
        barcodes: formData.barcodes,
      };

      await addLoanAdjustment(requestBody);
      toast.success('Relasi berhasil ditambahkan!');
      router.push('/loan-adjustments');
    } catch (error: any) {
      toast.error('Gagal menambahkan relasi', {
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
          <UserPlus className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tambah Relasi</h1>
        </div>
        <p className="text-muted-foreground">Tambahkan pinjaman tabung untuk relasi bisnis</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Form Tambah Relasi
            </CardTitle>
            <CardDescription>Isi form di bawah untuk menambahkan pinjaman tabung</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <CustomerSearchCombobox value={formData.customer_id} onChange={(value) => setFormData((prev) => ({ ...prev, customer_id: value }))} selectedData={(value) => setSelectedCustomer(value)} />
                </div>

                <DatePicker label="Tanggal Penyesuaian *" date={formData.adjustment_date} setDate={(date) => setFormData((prev: any) => ({ ...prev, adjustment_date: date }))} placeholder="Pilih tanggal penyesuaian" id="adjustment_date" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan *</Label>
                <Textarea id="notes" placeholder="Masukkan catatan untuk penyesuaian ini..." value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={4} required />
              </div>

              <div className="space-y-4">
                <Label>Barcode Tabung *</Label>
                <div className="flex gap-2">
                  <Input placeholder="Masukkan barcode tabung..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBarcode())} className="flex-1" />
                  <Button type="button" onClick={handleAddBarcode} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.barcodes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Barcode yang ditambahkan ({formData.barcodes.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.barcodes.map((barcode) => (
                        <Badge key={barcode} variant="secondary" className="flex items-center gap-1">
                          {barcode}
                          <button type="button" onClick={() => handleRemoveBarcode(barcode)} className="ml-1 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <Button type="submit" disabled={formData.barcodes.length === 0 || !formData.adjustment_date} className="bg-green-600 hover:bg-green-700">
                  Simpan Relasi
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
        title="Konfirmasi Tambah Relasi"
        description="Apakah Anda yakin ingin menambahkan pinjaman tabung untuk relasi ini?"
        confirmText="Ya, Tambahkan"
        onConfirm={handleConfirmSubmit}
        variant="default"
        details={{
          customer: selectedCustomer ? `${selectedCustomer?.company_name ? `${selectedCustomer?.company_name} ` : 'Individu'} - ${selectedCustomer?.customer_name}` : '-',
          date: formData.adjustment_date?.toLocaleDateString(),
          itemCount: formData.barcodes.length,
          items: formData.barcodes,
          notes: formData.notes,
        }}
      />
    </motion.div>
  );
}
