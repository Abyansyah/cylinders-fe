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
import { createWarehouseAction, updateWarehouseAction } from '../actions/warehouseActions';
import type { Warehouse } from '@/types/warehouse';
import { ChevronLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama gudang wajib diisi.' }),
  address: z.string().min(10, { message: 'Alamat wajib diisi.' }),
  phone_number: z.string().min(8, { message: 'Nomor telepon tidak valid.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface WarehouseFormProps {
  initialData?: Warehouse | null;
}

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
);

export function WarehouseForm({ initialData }: WarehouseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone_number: initialData?.phone_number || '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = isEditMode ? updateWarehouseAction(initialData.id, values) : createWarehouseAction(values);
      const result = await action;
      if (result.success) {
        toast.success(result.message);
        router.push('/warehouses');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/warehouses')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEditMode ? 'Ubah Data Gudang' : 'Tambah Gudang Baru'}</h1>
      </div>
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Ubah Data Gudang' : 'Tambah Gudang Baru'}</CardTitle>
        <CardDescription>Lengkapi detail gudang di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Nama Gudang</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Gudang Pusat Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <RequiredFormLabel>Nomor Telepon</RequiredFormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 02189901234" {...field} />
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
                  <RequiredFormLabel>Alamat Lengkap</RequiredFormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Masukkan alamat lengkap gudang..." {...field} />
                  </FormControl>
                  <FormMessage />
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
