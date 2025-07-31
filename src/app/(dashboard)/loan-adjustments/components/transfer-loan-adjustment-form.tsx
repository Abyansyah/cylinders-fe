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
import { ConfirmationDialog } from './confirmation-dialog';
import { ArrowLeft, ArrowRightLeft, Plus, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CustomerSearchCombobox } from './customer-search-combobox';
import { Customer } from '@/types/customer';
import { transferLoan } from '@/services/loanAdjustmentService';

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
  from_customer_id: string;
  to_customer_id: string;
  notes: string;
  barcodes: string[];
}

export default function TransferLoanAdjustmentForm() {
  const router = useRouter();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    from_customer_id: '',
    to_customer_id: '',
    notes: '',
    barcodes: [],
  });

  const [selectedFromCustomer, setSelectedFromCustomer] = useState<Customer | null>(null);
  const [selectedToCustomer, setSelectedToCustomer] = useState<Customer | null>(null);

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
    if (formData.from_customer_id === formData.to_customer_id) {
      toast.error('Customer asal dan tujuan tidak boleh sama.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      const requestBody = {
        from_customer_id: Number.parseInt(formData.from_customer_id),
        to_customer_id: Number.parseInt(formData.to_customer_id),
        barcodes: formData.barcodes,
        notes: formData.notes,
      };

      await transferLoan(requestBody);
      toast.success('Transfer relasi berhasil!');
      router.push('/loan-adjustments');
    } catch (error: any) {
      toast.error('Gagal melakukan transfer relasi', {
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
          <ArrowRightLeft className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Transfer Relasi</h1>
        </div>
        <p className="text-muted-foreground">Transfer pinjaman tabung antar relasi bisnis</p>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              Form Transfer Relasi
            </CardTitle>
            <CardDescription>Isi form di bawah untuk mentransfer pinjaman tabung</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Dari Customer *</Label>
                  <CustomerSearchCombobox
                    value={formData.from_customer_id}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        from_customer_id: value,
                        to_customer_id: prev.to_customer_id === value ? '' : prev.to_customer_id,
                      }));
                    }}
                    selectedData={(value) => setSelectedFromCustomer(value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_customer">Ke Customer *</Label>
                  <CustomerSearchCombobox value={formData.to_customer_id} onChange={(value) => setFormData((prev) => ({ ...prev, to_customer_id: value }))} selectedData={(value) => setSelectedToCustomer(value)} />
                </div>
              </div>

              {selectedFromCustomer && selectedToCustomer && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="font-medium text-blue-900">{selectedFromCustomer.customer_name}</div>
                      <div className="text-sm text-blue-700">{selectedFromCustomer.company_name}</div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-blue-600" />
                    <div className="text-center">
                      <div className="font-medium text-blue-900">{selectedToCustomer.customer_name}</div>
                      <div className="text-sm text-blue-700">{selectedToCustomer.company_name}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan *</Label>
                <Textarea id="notes" placeholder="Masukkan catatan untuk transfer ini..." value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={4} required />
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
                    <Label className="text-sm text-muted-foreground">Barcode yang akan ditransfer ({formData.barcodes.length})</Label>
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
                <Button type="submit" disabled={formData.barcodes.length === 0 || !formData.from_customer_id || !formData.to_customer_id} className="bg-blue-600 hover:bg-blue-700">
                  Transfer Relasi
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
        title="Konfirmasi Transfer Relasi"
        description="Apakah Anda yakin ingin mentransfer pinjaman tabung antar relasi ini?"
        confirmText="Ya, Transfer"
        onConfirm={handleConfirmSubmit}
        variant="default"
        details={{
          fromCustomer: selectedFromCustomer ? `${selectedFromCustomer.customer_name} (${selectedFromCustomer.company_name})` : undefined,
          toCustomer: selectedToCustomer ? `${selectedToCustomer.customer_name} (${selectedToCustomer.company_name})` : undefined,
          itemCount: formData.barcodes.length,
          items: formData.barcodes,
          notes: formData.notes,
        }}
      />
    </motion.div>
  );
}
