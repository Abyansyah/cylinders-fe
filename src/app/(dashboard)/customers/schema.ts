'use client';

import { z } from 'zod';

export const createCustomerSchema = z.object({
  customer_name: z.string().min(3, 'Nama pelanggan wajib diisi.'),
  company_name: z.string().optional(),
  phone_number: z.string().min(8, 'Nomor telepon tidak valid.'),
  email: z.string().email('Format email tidak valid.'),
  shipping_address_default: z.string().min(10, 'Alamat pengiriman wajib diisi.'),
  contact_person: z.string().min(3, 'Kontak person wajib diisi.'),
  customer_type: z.enum(['Individual', 'Corporate'], { required_error: 'Tipe pelanggan wajib dipilih.' }),
  username: z.string().min(5, 'Username minimal 5 karakter.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
  payment_term_days: z.coerce.number(),
  is_active: z.boolean(),
});

export const updateCustomerSchema = createCustomerSchema.extend({
  password: z.string().min(6, 'Password baru minimal 6 karakter.').optional().or(z.literal('')),
});
