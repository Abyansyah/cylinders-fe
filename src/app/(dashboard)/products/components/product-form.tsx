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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { createProductAction, updateProductAction } from '../actions/productActions';
import type { Product, ProductsApiResponse } from '@/types/product';
import { ChevronLeft } from 'lucide-react';
import { GasTypeSearchCombobox } from './gas-type-combobox';
import { CylinderPropertySearchCombobox } from './cylinder-property-combobox';
import { Label } from '@/components/ui/label';
import { CylinderProperySelect } from './cylinder-property-select';

interface ProductFormProps {
  initialData?: Product | null;
}

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama produk wajib diisi.' }),
  sku: z.string().min(3, { message: 'SKU produk wajib diisi.' }),
  description: z.string(),
  is_active: z.boolean(),
  unit: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
);

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      description: initialData?.description || '',
      unit: initialData?.unit || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = isEditMode ? updateProductAction(initialData.id, values) : createProductAction(values);

      const result = await action;
      if (result.success) {
        toast.success(result.message);
        router.push('/products');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/products')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEditMode ? 'Ubah Produk' : 'Buat Produk Baru'}</h1>
      </div>

      <Card className=" mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Ubah Produk' : 'Buat Produk Baru'}</CardTitle>
          <CardDescription>Lengkapi formulir di bawah untuk {isEditMode ? 'memperbarui' : 'menambah'} produk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Nama Produk</RequiredFormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Tabung Oksigen 1m³" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>SKU (Stock Keeping Unit)</RequiredFormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: O2-1M3-STL" {...field} />
                    </FormControl>
                    <FormDescription>Kode unik untuk produk ini. Wajib diisi.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Unit</RequiredFormLabel>
                    <FormControl>
                      <Input placeholder="Unit" {...field} />
                    </FormControl>
                    <FormDescription>Masukkan satuan produk.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <RequiredFormLabel>Deskripsi</RequiredFormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Jelaskan tentang produk ini..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <RequiredFormLabel>Status Produk</RequiredFormLabel>
                      <FormDescription>Jika aktif, produk dapat dilihat dan digunakan dalam transaksi.</FormDescription>
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
                  {isPending ? 'Menyimpan...' : isEditMode ? 'Perbarui Produk' : 'Tambah Produk'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
