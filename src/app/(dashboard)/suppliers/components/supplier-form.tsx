'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createSupplier, updateSupplier } from '@/services/supplierService';
import type { Supplier } from '@/types/supplier';
import { ChevronLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama supplier wajib diisi.' }),
  address: z.string().min(10, { message: 'Alamat wajib diisi.' }),
  phone_number: z.string().min(8, { message: 'Nomor telepon tidak valid.' }),
  contact_person: z.string().min(3, { message: 'Kontak person wajib diisi.' }),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface SupplierFormProps {
  initialData?: Supplier | null;
}

export function SupplierForm({ initialData }: SupplierFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone_number: initialData?.phone_number || '',
      contact_person: initialData?.contact_person || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (isEditMode) {
          await updateSupplier(initialData!.id, values);
          toast.success('Supplier berhasil diperbarui.');
        } else {
          await createSupplier(values);
          toast.success('Supplier berhasil ditambahkan.');
        }
        router.push('/suppliers');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Terjadi kesalahan.');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/suppliers')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEditMode ? 'Ubah Data Vendor' : 'Tambah Vendor Baru'}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Ubah Data Vendor' : 'Tambah Vendor Baru'}</CardTitle>
          <CardDescription>Lengkapi detail vendor di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Vendor *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: PT Gas Sejahtera" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat *</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Masukkan alamat lengkap supplier..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: 081234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontak Person *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama yang bisa dihubungi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Status Supplier</FormLabel>
                      <CardDescription>Jika aktif, supplier dapat digunakan dalam transaksi.</CardDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
