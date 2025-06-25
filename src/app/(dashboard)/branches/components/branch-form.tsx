'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SearchableSelect } from '@/components/ui/searchable-select';

import { createBranchAction, updateBranchAction } from '../actions/branchActions';
import { regionFetcher } from '@/services/regionService';
import type { Branch } from '@/types/branch';
import type { Province, Regency } from '@/types/region';
import { ChevronLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Nama cabang wajib diisi.'),
  branch_code: z.string().min(3, 'Kode cabang wajib diisi.'),
  address: z.string().min(10, 'Alamat wajib diisi.'),
  province: z.string({ required_error: 'Provinsi wajib dipilih.' }),
  city: z.string({ required_error: 'Kota/Kabupaten wajib dipilih.' }),
  postal_code: z.string().min(5, 'Kode pos tidak valid.'),
  phone_number: z.string().min(8, 'Nomor telepon tidak valid.'),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface BranchFormProps {
  initialData?: Branch | null;
}

const RequiredFormLabel = ({ children }: { children: React.ReactNode }) => (
  <FormLabel>
    {children}
    <span className="text-red-500 ml-1">*</span>
  </FormLabel>
);

export function BranchForm({ initialData }: BranchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      branch_code: initialData?.branch_code || '',
      address: initialData?.address || '',
      province: initialData?.province || undefined,
      city: initialData?.city || undefined,
      postal_code: initialData?.postal_code || '',
      phone_number: initialData?.phone_number || '',
      is_active: initialData?.is_active ?? true,
    },
  });

  const { data: provincesData, isLoading: isLoadingProvinces } = useSWR<Province[]>('/provinces', regionFetcher);
  const selectedProvinceName = form.watch('province');
  const selectedProvinceId = provincesData?.find((p) => p.name === selectedProvinceName)?.id;
  const { data: regenciesData, isLoading: isLoadingRegencies } = useSWR<Regency[]>(selectedProvinceId ? `/provinces/${selectedProvinceId}/regencies` : null, regionFetcher);

  const provinceOptions = provincesData?.map((p) => ({ value: p.name, label: p.name })) || [];
  const regencyOptions = regenciesData?.map((r) => ({ value: r.name, label: r.name })) || [];

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const action = isEditMode ? updateBranchAction(initialData.id, values) : createBranchAction(values);
      const result = await action;
      if (result.success) {
        toast.success(result.message);
        router.push('/branches');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/branches')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEditMode ? 'Ubah Data Cabang' : 'Buat Cabang Baru'}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Ubah Data Cabang' : 'Tambah Cabang Baru'}</CardTitle>
          <CardDescription>Lengkapi semua informasi yang ditandai (*).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Informasi Dasar</h3>
                <Separator className="my-4" />
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Nama Cabang</RequiredFormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Cabang Surabaya Pusat" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="branch_code"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Kode Cabang</RequiredFormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: SBY-PUSAT" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Lokasi & Kontak</h3>
                <Separator className="my-4" />
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Controller
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <RequiredFormLabel>Provinsi</RequiredFormLabel>
                          <SearchableSelect
                            placeholder="Pilih provinsi..."
                            searchPlaceholder="Cari provinsi..."
                            emptyMessage="Provinsi tidak ditemukan."
                            options={provinceOptions}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              form.resetField('city');
                            }}
                            disabled={isLoadingProvinces}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <RequiredFormLabel>Kota/Kabupaten</RequiredFormLabel>
                          <SearchableSelect
                            placeholder="Pilih kota/kabupaten..."
                            searchPlaceholder="Cari kota/kabupaten..."
                            emptyMessage="Kota/Kabupaten tidak ditemukan."
                            options={regencyOptions}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!selectedProvinceId || isLoadingRegencies}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <RequiredFormLabel>Alamat Lengkap</RequiredFormLabel>
                        <FormControl>
                          <Textarea placeholder="Nama jalan, nomor, RT/RW..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <RequiredFormLabel>Kode Pos</RequiredFormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: 60241" {...field} />
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
                            <Input placeholder="Contoh: 081212345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <RequiredFormLabel>Status Cabang</RequiredFormLabel>
                      <FormDescription>Jika aktif, cabang dapat beroperasi dan dipilih dalam transaksi.</FormDescription>
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
