import { z } from 'zod';

export const productFormSchema = z.object({
  name: z.string().min(3, { message: 'Nama produk wajib diisi (minimal 3 karakter).' }),
  sku: z.string().optional(),
  description: z.string().optional(),

  is_active: z.boolean().default(true),

  cylinder_properties_id: z.coerce.number({ required_error: 'Properti tabung wajib dipilih.' }),
  gas_type_id: z.coerce.number({ required_error: 'Tipe gas wajib dipilih.' }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
