'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import useSWR from 'swr';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

import { ChevronLeft, Save, ScanLine, Keyboard, AlertCircle, Calendar, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTransition } from '@/components/page-transition';
import { BarcodeScanner } from '@/components/features/barcode-scanner';
import { BarcodeExistsDialog } from './barcode-exist-dialog';
import { SuccessDialog } from './success-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

import { checkBarcodeExists, createCylinder, getValidGasTypes } from '@/services/cylinderService';
import { getCylinderProperties } from '@/services/cylinderPropertyService';
import { getGasTypes } from '@/services/gasTypeService';
import { getWarehouses } from '@/services/warehouseService';

import type { CylinderProperty } from '@/types/cylinder-property';
import type { GasType } from '@/types/gas-type';
import type { Warehouse } from '@/types/warehouse';

const formSchema = z
  .object({
    barcode_id: z.string().min(1, 'Barcode ID wajib diisi.'),
    serial_number: z.string().min(3, 'Serial number wajib diisi (minimal 3 karakter).'),
    cylinder_properties_id: z.number({ required_error: 'Jenis tabung wajib dipilih.' }),
    warehouse_id: z.number({ required_error: 'Gudang wajib dipilih.' }),
    status: z.enum(['Di Gudang - Kosong', 'Di Gudang - Terisi']),
    manufacture_date: z.date({ required_error: 'Tanggal produksi wajib diisi.' }),
    notes: z.string().optional(),
    gas_type_id: z.number().nullable(),
    last_fill_date: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'Di Gudang - Terisi') {
      if (!data.gas_type_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['gas_type_id'],
          message: 'Jenis gas wajib dipilih jika status terisi.',
        });
      }
      if (!data.last_fill_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['last_fill_date'],
          message: 'Tanggal pengisian terakhir wajib diisi jika status terisi.',
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface ComboboxProps {
  options: Array<{ value: number; label: string; description?: string }>;
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  isLoading?: boolean;
}

function Combobox({ options, value, onValueChange, placeholder, searchPlaceholder, emptyText, isLoading }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  <div>
                    <p>{option.label}</p>
                    {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CylinderFormCreate() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<'input' | 'form'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingBarcode, setIsCheckingBarcode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  const [barcodeDialog, setBarcodeDialog] = useState({ open: false, isExisting: false, barcode: '' });
  const [successDialog, setSuccessDialog] = useState({ open: false, barcode: '' });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barcode_id: '',
      serial_number: '',
      status: 'Di Gudang - Kosong',
      notes: '',
      gas_type_id: null,
      last_fill_date: null,
      warehouse_id: user?.warehouse_id,
    },
  });

  const selectedCylinderPropertyId = form.watch('cylinder_properties_id');

  const { data: cylinderPropsRes, isLoading: isLoadingProps } = useSWR('/cylinder-properties?limit=1000', () => getCylinderProperties({ limit: 1000 }));
  const { data: warehousesRes, isLoading: isLoadingWarehouses } = useSWR(user?.role.role_name !== 'Petugas Gudang' ? '/warehouses?limit=1000' : null, () => getWarehouses({ limit: 1000 }));
  const { data: validGasesRes, isLoading: isLoadingValidGases } = useSWR(
    selectedCylinderPropertyId ? `/cylinders/valid-gases?cylinder_properties_id=${selectedCylinderPropertyId}` : null,
    () => getValidGasTypes(selectedCylinderPropertyId!),
    {
      revalidateOnFocus: false,
    }
  );
  const isPetugasGudang = user?.role.role_name === 'Petugas Gudang';

  useEffect(() => {
    if (isPetugasGudang && user?.warehouse_id) {
      form.setValue('warehouse_id', user.warehouse_id);
    }
  }, [isPetugasGudang, user?.warehouse_id, form]);

  const handleBarcodeCheck = async (barcode: string) => {
    if (!/^\d{9}$/.test(barcode)) {
      toast.error('Barcode harus terdiri dari 9 digit angka.');
      return;
    }

    setIsCheckingBarcode(true);
    try {
      const { existing } = await checkBarcodeExists(barcode);
      if (existing) {
        setBarcodeDialog({ open: true, isExisting: true, barcode });
      } else {
        form.setValue('barcode_id', barcode);
        setCurrentStep('form');
        toast.success(`Barcode ${barcode} tersedia dan siap digunakan.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memeriksa barcode.');
    } finally {
      setIsCheckingBarcode(false);
      setManualBarcode('');
    }
  };

  const onSubmit = (values: FormValues) => {
    setIsLoading(true);
    const payload = {
      ...values,
      manufacture_date: format(values.manufacture_date, 'yyyy-MM-dd'),
      last_fill_date: values.last_fill_date ? format(values.last_fill_date, 'yyyy-MM-dd') : null,
      gas_type_id: values.status === 'Di Gudang - Kosong' ? null : values.gas_type_id,
    };

    createCylinder(payload as any)
      .then(() => {
        setSuccessDialog({ open: true, barcode: values.barcode_id });
      })
      .catch((error: any) => {
        let responseData = error.response?.data;
        console.log(error?.response?.data?.errors);
        if (error?.response?.data?.errors) {
          const errorMessages = responseData?.errors?.map((err: { msg: string }) => `${err.msg}`).join(', ');
          toast.error(` ${errorMessages}`);
          return;
        }

        toast.error(error.response?.data?.message || 'Gagal menambahkan tabung baru.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetForm = () => {
    form.reset({
      barcode_id: '',
      serial_number: '',
      status: 'Di Gudang - Kosong',
      notes: '',
      gas_type_id: null,
      last_fill_date: null,
      manufacture_date: undefined,
      warehouse_id: isPetugasGudang ? user?.warehouse_id : undefined,
    });
    setCurrentStep('input');
    setSuccessDialog({ open: false, barcode: '' });
  };

  const renderContent = () => {
    if (currentStep === 'form') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={resetForm}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Tambah Tabung Gas Baru</h1>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Detail Tabung</CardTitle>
                    <CardDescription>Lengkapi informasi tabung di bawah ini.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="barcode_id"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Barcode ID</Label>
                            <Input {...field} disabled className="font-mono bg-muted" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serial_number"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Serial Number *</Label>
                            <Input {...field} placeholder="SN-XXXXXXX" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="cylinder_properties_id"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Jenis Tabung *</Label>
                          <Combobox
                            options={cylinderPropsRes?.data.map((p: CylinderProperty) => ({ value: p.id, label: p.name, description: `${p.size_cubic_meter} m³ | ${p.material}` })) || []}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Pilih jenis tabung..."
                            searchPlaceholder="Cari jenis tabung..."
                            emptyText="Jenis tabung tidak ditemukan."
                            isLoading={isLoadingProps}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!isPetugasGudang && (
                      <FormField
                        control={form.control}
                        name="warehouse_id"
                        render={({ field }) => (
                          <FormItem>
                            <Label>Gudang *</Label>
                            <Combobox
                              options={warehousesRes?.data.map((w: Warehouse) => ({ value: w.id, label: w.name })) || []}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Pilih gudang..."
                              searchPlaceholder="Cari gudang..."
                              emptyText="Gudang tidak ditemukan."
                              isLoading={isLoadingWarehouses}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Status Awal *</Label>
                          <Controller
                            control={form.control}
                            name="status"
                            render={({ field: controllerField }) => (
                              <Combobox
                                options={[
                                  { value: 1, label: 'Di Gudang - Kosong' },
                                  { value: 2, label: 'Di Gudang - Terisi' },
                                ]}
                                value={controllerField.value === 'Di Gudang - Kosong' ? 1 : 2}
                                onValueChange={(val) => {
                                  const newStatus = val === 1 ? 'Di Gudang - Kosong' : 'Di Gudang - Terisi';
                                  controllerField.onChange(newStatus);
                                  if (newStatus === 'Di Gudang - Kosong') {
                                    form.setValue('gas_type_id', null);
                                    form.setValue('last_fill_date', null);
                                  }
                                }}
                                placeholder="Pilih status"
                                searchPlaceholder="Cari status"
                                emptyText="Status tidak ditemukan"
                              />
                            )}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('status') === 'Di Gudang - Terisi' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="gas_type_id"
                          render={({ field }) => (
                            <FormItem>
                              <Label>Jenis Gas *</Label>
                              <Combobox
                                options={validGasesRes?.data.map((g: GasType) => ({ value: g.id, label: g.name })) || []}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Pilih jenis gas..."
                                searchPlaceholder="Cari jenis gas..."
                                emptyText="Jenis gas tidak ditemukan."
                                isLoading={isLoadingValidGases}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="last_fill_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Label>Tanggal Pengisian Terakhir *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, 'dd MMMM yyyy', { locale: indonesiaLocale }) : <span>Pilih tanggal</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent mode="single" selected={field.value ?? undefined} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    <FormField
                      control={form.control}
                      name="manufacture_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Label>Tanggal Produksi *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, 'dd MMMM yyyy', { locale: indonesiaLocale }) : <span>Pilih tanggal</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date('1900-01-01')} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Catatan</Label>
                          <Textarea {...field} placeholder="Catatan tambahan (opsional)" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Aksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Pastikan semua data sudah benar sebelum menyimpan. Data yang sudah disimpan tidak dapat diubah.</AlertDescription>
                      </Alert>
                      <Button type="submit" disabled={isLoading} className="w-full mt-4">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" /> Simpan Tabung
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </Form>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/cylinders')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Tambah Tabung Gas Baru</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 md:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowScanner(true)}>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <ScanLine className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Scan Barcode</CardTitle>
                <CardDescription>Gunakan kamera untuk memindai barcode tabung gas.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Keyboard className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Input Manual</CardTitle>
                <CardDescription>Masukkan 9 digit barcode secara manual.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input id="manual-barcode" placeholder="Contoh: 123456789" maxLength={9} value={manualBarcode} className="font-mono text-center text-lg h-12" onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))} />
                </div>
                <Button onClick={() => handleBarcodeCheck(manualBarcode)} className="w-full mt-3" disabled={isCheckingBarcode || manualBarcode.length !== 9}>
                  {isCheckingBarcode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Periksa Barcode
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  };

  return (
    <PageTransition>
      {renderContent()}

      {showScanner && <BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleBarcodeCheck} />}
      <BarcodeExistsDialog open={barcodeDialog.open} onOpenChange={(open) => setBarcodeDialog({ ...barcodeDialog, open })} barcode={barcodeDialog.barcode} isExisting={barcodeDialog.isExisting} />
      <SuccessDialog open={successDialog.open} onOpenChange={(open) => setSuccessDialog({ ...successDialog, open })} barcode={successDialog.barcode} onAddAnother={resetForm} onFinish={() => router.push('/cylinders')} />
    </PageTransition>
  );
}
