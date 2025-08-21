'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getCustomerById, updateCustomerPriceList } from '@/services/customerService';
import { getProductsSelect } from '@/services/SearchListService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PriceListRequestBody } from '@/types/customer';
import { formatRupiah, unformatRupiah } from '@/utils/format';

const priceListSchema = z.object({
  product_id: z.string().min(1, 'Produk harus dipilih.'),
  rent_price: z.string().optional(),
  buy_price: z.string().optional(),
});

const formSchema = z.object({
  pricelists: z
    .array(priceListSchema)
    .min(1, 'Minimal harus ada satu produk dalam daftar harga.')
    .superRefine((pricelists, ctx) => {
      const seen = new Set<string>();
      pricelists.forEach((item, index) => {
        if (seen.has(item.product_id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Produk ini sudah dipilih di daftar harga.',
            path: [index, 'product_id'],
          });
        }
        seen.add(item.product_id);
      });
    }),
});

type PriceListFormValues = z.infer<typeof formSchema>;

export default function CustomerPriceListForm() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id as string);

  const { data: customer, isLoading: isLoadingCustomer } = useSWR(customerId ? `/customers/${customerId}` : null, () => getCustomerById(customerId));
  const { data: productsResponse, isLoading: isLoadingProducts } = useSWR('/select-lists/products', getProductsSelect);
  const products: any[] = productsResponse?.data || [];

  const form = useForm<PriceListFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pricelists: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'pricelists',
  });

  useEffect(() => {
    if (customer?.pricelists) {
      const initialData = customer.pricelists.map((item) => ({
        product_id: item.product.id.toString(),
        rent_price: item.rentPrice ? parseInt(item.rentPrice).toString() : '',
        buy_price: item.buyPrice ? parseInt(item.buyPrice).toString() : '',
      }));
      form.reset({ pricelists: initialData });
    }
  }, [customer, form]);

  const onSubmit = async (data: PriceListFormValues) => {
    const payload: PriceListRequestBody[] = data.pricelists.map((item) => ({
      product_id: Number(item.product_id),
      rent_price: item.rent_price ? parseFloat(item.rent_price) : null,
      buy_price: item.buy_price ? parseFloat(item.buy_price) : null,
    }));

    try {
      await updateCustomerPriceList(customerId, payload);
      toast.success('Daftar harga berhasil diperbarui.');
      router.push(`/customers/${customerId}`);
    } catch (error: any) {
      toast.error('Gagal memperbarui daftar harga.', {
        description: error?.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    }
  };

  if (isLoadingCustomer || isLoadingProducts) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Daftar Harga</h1>
          <p className="text-muted-foreground">Atur harga sewa dan beli khusus untuk {customer?.customer_name}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Produk dan Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`pricelists.${index}.product_id`}
                    render={({ field }) => (
                      <FormItem className="col-span-5">
                        <FormLabel>Produk</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih produk..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.value} value={product.value.toString()}>
                                {product.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`pricelists.${index}.rent_price`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Harga Sewa</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Contoh: 45000"
                            value={formatRupiah(field.value ?? '')}
                            onChange={(e) => {
                              const raw = unformatRupiah(e.target.value);
                              field.onChange(raw);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`pricelists.${index}.buy_price`}
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Harga Beli</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Contoh: 1400000"
                            value={formatRupiah(field.value ?? '')}
                            onChange={(e) => {
                              const raw = unformatRupiah(e.target.value);
                              field.onChange(raw);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-1 flex items-end h-full">
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ product_id: '', rent_price: '', buy_price: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Daftar Harga'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
