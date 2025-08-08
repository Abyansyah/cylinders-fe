'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCylinderPropertyAction, updateCylinderPropertyAction } from '../actions/cylinderPropertyActions';
import type { CylinderProperty } from '@/types/cylinder-property';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal terdiri dari 3 karakter.' }),
  size_cubic_meter: z.coerce.number({ invalid_type_error: 'Ukuran harus berupa angka.' }).positive({ message: 'Size must be a positive number.' }),
  material: z.string().optional(),
  max_age_years: z.coerce.number({ invalid_type_error: 'Usia maksimal harus berupa angka.' }).int({ message: 'Max age must be a whole number.' }).positive({ message: 'Max age must be positive.' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CylinderPropertyFormProps {
  initialData?: CylinderProperty | null;
}

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
);

export function CylinderPropertyForm({ initialData }: CylinderPropertyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      size_cubic_meter: Number(initialData?.size_cubic_meter) || undefined,
      material: initialData?.material || '',
      max_age_years: initialData?.max_age_years || undefined,
      notes: initialData?.notes || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = isEditMode ? updateCylinderPropertyAction(initialData.id, values) : createCylinderPropertyAction(values);

      const result = await action;

      if (result.success) {
        toast.success(result.message);
        router.push('/cylinder-properties');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/cylinder-properties')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEditMode ? 'Detail Properti tabung' : 'Tambah Properti tabung'}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Properti tabung' : 'Tambah Properti tabung'}</CardTitle>
          <CardDescription>Isi form di bawah untuk {isEditMode ? 'edit' : 'tambah'} properti tabung.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Spesifikasi Utama</h3>
                <p className="text-sm text-muted-foreground">Detail utama dari properti tabung.</p>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Nama Properti</RequiredFormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Tabung Baja 6m³" {...field} />
                        </FormControl>
                        <FormDescription>A unique name for this cylinder type.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Material</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Baja (Steel)" {...field} />
                        </FormControl>
                        <FormDescription>The primary material of the cylinder.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Detail Teknis</h3>
                <p className="text-sm text-muted-foreground">Infromasi volume dan usia maksimum</p>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="size_cubic_meter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size (m³)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="decimal"
                            pattern="^\d+\.\d{1,2}$"
                            onKeyDown={(e) => {
                              if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                                e.preventDefault();
                              }
                              if (e.key === '.' && (e.currentTarget.value.includes('.') || e.currentTarget.value === '')) {
                                e.preventDefault();
                              }
                            }}
                            placeholder="e.g., 6.0"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Kapasitas volume dalam meter kubik.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="max_age_years"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Usia Maksimal (Years)</RequiredFormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 10"
                            min={1}
                            inputMode="numeric"
                            pattern="\d*"
                            max={99}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onInput={(e) => {
                              const input = e.currentTarget;
                              if (input.value.length > 2) {
                                input.value = input.value.slice(0, 2);
                              }
                            }}
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormDescription>Masa pakai maksimum yang direkomendasikan.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Informasi Tambahan</h3>
                <Separator className="my-2" />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Masukkan catatan tambahan jika ada..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : isEditMode ? 'Update Properti Tabung' : 'Tambah Properti Tabung'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
