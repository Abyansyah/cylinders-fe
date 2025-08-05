'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { GasConversionRequest } from '@/types/gas-conversion';
import { toast } from 'sonner';
import { getProducts } from '@/services/productService';
import { createGasConversion } from '@/services/gasConversionService';
import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { Product } from '@/types/product';

export const PACKAGING_TYPES = [
  { value: 'TABUNG', label: 'Tabung' },
  { value: 'PGS', label: 'PGS' },
  { value: 'CONTAINER', label: 'Container' },
  { value: 'RANGER', label: 'Ranger' },
  { value: 'ISO TANK', label: 'ISO Tank' },
  { value: 'STORAGE TANK', label: 'Storage Tank' },
];

export default function CreateGasConversionForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<GasConversionRequest>({
    packaging_type: '',
    from_product_id: 0,
    to_product_id: 0,
    quantity: 1,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createGasConversion(formData);
      toast.success('Permintaan alih fungsi gas berhasil dibuat!');
      router.push('/gas-conversions');
    } catch (error: any) {
      toast.error('Gagal membuat permintaan', {
        description: error.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.packaging_type && formData.from_product_id > 0 && formData.to_product_id > 0 && formData.quantity > 0 && formData.notes.trim() && formData.from_product_id !== formData.to_product_id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gas-conversions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Permintaan Alih Fungsi Gas</h1>
          <p className="text-muted-foreground">Buat permintaan baru untuk pengalihan jenis gas pada tabung</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Permintaan</CardTitle>
          <CardDescription>Lengkapi form di bawah ini untuk membuat permintaan alih fungsi gas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="packaging_type">Jenis Kemasan *</Label>
                <Select value={formData.packaging_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, packaging_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kemasan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PACKAGING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah *</Label>
                <Input id="quantity" type="number" min="1" value={formData.quantity} onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))} placeholder="Masukkan jumlah" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Produk Asal *</Label>
                <GenericSearchCombobox<Product>
                  value={formData.from_product_id.toString()}
                  onChange={(value: any) => setFormData((prev) => ({ ...prev, from_product_id: Number(value) }))}
                  fetcher={(params) => getProducts({ ...params })}
                  labelExtractor={(p) => p.name}
                  placeholder="Pilih produk asal..."
                  searchKey="/products"
                />
              </div>

              <div className="space-y-2">
                <Label>Produk Tujuan *</Label>
                <GenericSearchCombobox<Product>
                  value={formData.to_product_id.toString()}
                  onChange={(value) => setFormData((prev) => ({ ...prev, to_product_id: Number(value) }))}
                  fetcher={(params) => getProducts({ ...params })}
                  labelExtractor={(p) => p.name}
                  placeholder="Pilih produk tujuan..."
                  searchKey="/products"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan *</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Masukkan catatan atau alasan permintaan alih fungsi gas..." rows={4} />
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/gas-conversions">Batal</Link>
              </Button>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Buat Permintaan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
