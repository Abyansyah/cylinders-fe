'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { createCustomerAction, updateCustomerAction } from '../actions/customerActions';
import type { Customer } from '@/types/customer';
import { z } from 'zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createCustomerSchema, updateCustomerSchema } from '../schema';

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
);

export function CustomerForm({ initialData }: { initialData?: Customer | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const isEditMode = !!initialData;

  const formSchema = isEditMode ? updateCustomerSchema : createCustomerSchema;
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: initialData?.customer_name || '',
      company_name: initialData?.company_name || '',
      phone_number: initialData?.phone_number || '',
      email: initialData?.email || '',
      shipping_address_default: initialData?.shipping_address_default || '',
      contact_person: initialData?.contact_person || '',
      customer_type: initialData?.customer_type || 'Individual',
      username: initialData?.userAccount.username || '',
      password: '',
      is_active: initialData?.userAccount.is_active ?? true,
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = isEditMode ? updateCustomerAction(initialData.id, values) : createCustomerAction(values);
      const result = await action;
      if (result.success) {
        toast.success(result.message);
        router.push('/customers');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/customers')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEditMode ? 'Ubah Data Pelanggan' : 'Buat Pelanggan Baru'}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Ubah Data Pelanggan' : 'Tambah Pelanggan Baru'}</CardTitle>
          <CardDescription>Lengkapi informasi di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Informasi Pelanggan</h3>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customer_name"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Nama Pelanggan</RequiredFormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Budi Santoso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Perusahaan (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: PT Sejahtera" {...field} />
                        </FormControl>
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
                          <Input placeholder="Contoh: 08123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Email</RequiredFormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Contoh: budi.s@gmail.com" {...field} />
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
                        <RequiredFormLabel>Kontak Person</RequiredFormLabel>
                        <FormControl>
                          <Input placeholder="Nama yang bisa dihubungi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer_type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <RequiredFormLabel>Tipe Pelanggan</RequiredFormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Individual" />
                              </FormControl>
                              <FormLabel className="font-normal">Perorangan</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Corporate" />
                              </FormControl>
                              <FormLabel className="font-normal">Perusahaan</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="shipping_address_default"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Alamat Pengiriman Utama</RequiredFormLabel>
                        <FormControl>
                          <Textarea rows={3} placeholder="Masukkan alamat lengkap..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Akun Login Pelanggan</h3>
                <p className="text-sm text-muted-foreground">Detail untuk pelanggan agar bisa login ke sistem.</p>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Username</RequiredFormLabel>
                        <FormControl>
                          <Input placeholder="Username unik..." {...field} disabled={isEditMode} />
                        </FormControl>
                        {isEditMode && <FormDescription>Username tidak dapat diubah.</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password {!isEditMode && <span className="text-red-500 ml-1">*</span>}</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type={showPassword ? 'text' : 'password'} placeholder="******" {...field} />
                          </FormControl>
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                        {isEditMode && <FormDescription>Isi hanya jika ingin mengubah password.</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <RequiredFormLabel>Status Akun Pelanggan</RequiredFormLabel>
                      <FormDescription>Jika aktif, pelanggan dapat login ke akun mereka.</FormDescription>
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
