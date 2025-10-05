'use client';

import type React from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTransition } from '@/components/page-transition';
import type { Cylinder, UpdateCylinderStatusRequest } from '@/types/cylinder';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { updateCylinderStatus } from '@/services/cylinderService';
import { toast } from 'sonner';
import { Combobox } from '@/components/combobox';
import { useDebounce } from '@/hooks/use-debounce';
import { getCustomersSelectList } from '@/services/SearchListService';
import useSWR from 'swr';

const EDITABLE_STATUSES = ['Di Gudang - Kosong', 'Di Gudang - Terisi', 'Perlu Inspeksi', 'Rusak', 'Tidak Aktif'];

interface EditCylinderViewProps {
  cylinder: Cylinder;
}

export default function EditCylinderView({ cylinder }: EditCylinderViewProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const [lastFillDate, setLastFillDate] = useState<Date | undefined>(cylinder.last_fill_date ? parseISO(cylinder.last_fill_date) : undefined);

  const [formData, setFormData] = useState<UpdateCylinderStatusRequest>({
    status: cylinder.status as any,
    gas_type_id: cylinder.gas_type_id ?? undefined,
    notes: cylinder.notes || '',
    owner_customer_id: cylinder.owner_customer_id ?? undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  const { data: customersResponse, isLoading: isLoadingCustomers } = useSWR(`/select-lists/customers?search=${debouncedCustomerSearch}`, () =>
    getCustomersSelectList({ search: debouncedCustomerSearch, relation_type: 'SUPPLIER_AND_CLIENT', include_id: !debouncedCustomerSearch && formData.owner_customer_id ? formData.owner_customer_id : undefined })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (formData.status === 'Di Gudang - Terisi') {
      if (!lastFillDate) newErrors.last_fill_date = 'Tanggal pengisian wajib diisi.';
    }
    if (!formData.notes) {
      newErrors.notes = 'Catatan wajib diisi.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    const submitData: UpdateCylinderStatusRequest = {
      ...formData,
      gas_type_id: formData.status === 'Di Gudang - Terisi' ? formData.gas_type_id : undefined,
      last_fill_date: formData.status === 'Di Gudang - Terisi' ? (lastFillDate ? format(lastFillDate, 'yyyy-MM-dd') : undefined) : undefined,
    };

    try {
      await updateCylinderStatus(cylinder.id, submitData);
      toast.success('Status tabung gas berhasil diperbarui.', {
        duration: 3000,
      });
      router.push(`/cylinders/${cylinder.serial_number}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating cylinder:', error);
      toast.error('Terjadi kesalahan saat memperbarui status tabung gas.');
    } finally {
      setIsSaving(false);
    }
  };

  const isChanged = useMemo(() => {
    const initialLastFillDate = cylinder.last_fill_date ? parseISO(cylinder.last_fill_date) : undefined;

    if (formData.status !== cylinder.status) return true;
    if ((formData.notes || '') !== (cylinder.notes || '')) return true;

    if (formData.status === 'Di Gudang - Terisi') {
      if (formData.gas_type_id !== cylinder.gas_type_id) return true;
      if (lastFillDate?.getTime() !== initialLastFillDate?.getTime()) return true;
    }
    if (formData?.owner_customer_id !== undefined && formData?.owner_customer_id !== cylinder?.owner_customer_id) return true;

    return false;
  }, [formData, lastFillDate, cylinder]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push(`/cylinders`)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Status Tabung Gas</h1>
            <p className="text-muted-foreground">Perbarui status tabung gas {cylinder.barcode_id}</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Tabung</CardTitle>
                    <CardDescription>Data tabung gas yang akan diperbarui</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Barcode ID</label>
                        <p className="text-lg font-mono font-semibold">{cylinder.barcode_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                        <p className="font-mono">{cylinder.serial_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Jenis Produk</label>
                        <p className="font-medium">{cylinder.product.name}</p>
                        <p className="text-sm text-muted-foreground">{cylinder.product.sku}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Lokasi Saat Ini</label>
                        <p>{cylinder.currentWarehouse?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Perbarui Status</CardTitle>
                    <CardDescription>Ubah status dan informasi terkait tabung gas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status Baru *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            status: value as any,
                            gas_type_id: value !== 'Di Gudang - Terisi' ? undefined : prev.gas_type_id,
                          }));
                          if (errors.status) setErrors((e) => ({ ...e, status: '' }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EDITABLE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Ownership *</Label>
                      <Combobox
                        options={customersResponse?.data.map((g: any) => ({ value: g.value, label: g.label })) || []}
                        value={formData?.owner_customer_id}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            owner_customer_id: value ? Number(value) : null,
                          }));
                        }}
                        valueSearch={customerSearch}
                        setValueSearch={setCustomerSearch}
                        placeholder="Pilih customer..."
                        searchPlaceholder="Cari customer..."
                        emptyText="Customer tidak ditemukan."
                        isLoading={isLoadingCustomers}
                      />
                      {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                    </div>

                    {formData.status === 'Di Gudang - Terisi' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="last_fill_date">Tanggal Pengisian Terakhir *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !lastFillDate && 'text-muted-foreground')}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {lastFillDate ? format(lastFillDate, 'dd MMMM yyyy', { locale: id }) : 'Pilih tanggal'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={lastFillDate}
                                onSelect={(date) => {
                                  setLastFillDate(date);
                                  if (errors.last_fill_date) setErrors((e) => ({ ...e, last_fill_date: '' }));
                                }}
                                disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.last_fill_date && <p className="text-sm text-red-600">{errors.last_fill_date}</p>}
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan Perubahan *</Label>
                      <Textarea
                        id="notes"
                        placeholder="Contoh: Tabung telah selesai diinspeksi dan siap digunakan kembali."
                        value={formData.notes}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, notes: e.target.value }));
                          if (errors.notes) setErrors((e) => ({ ...e, notes: '' }));
                        }}
                        rows={3}
                        required
                      />
                      {errors.notes && <p className="text-sm text-red-600">{errors.notes}</p>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan & Simpan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status Lama:</span>
                      <span className="font-medium">{cylinder.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status Baru:</span>
                      <span className="font-medium text-primary">{formData.status}</span>
                    </div>
                    {lastFillDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tanggal Isi:</span>
                        <span>{format(lastFillDate, 'dd MMM yyyy', { locale: id })}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                      Batal
                    </Button>
                    <Button type="submit" disabled={isSaving || !isChanged} className="flex-1">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
