'use server';

import { revalidatePath } from 'next/cache';
import { createCustomer, updateCustomer, deleteCustomer } from '@/services/customerService';
import type { CustomerPayload } from '@/services/customerService';

type FormState = {
  success: boolean;
  message: string;
};

async function handleApiAction(promise: Promise<any>, successMessage: string): Promise<FormState> {
  try {
    await promise;
    revalidatePath('/customers');
    return { success: true, message: successMessage };
  } catch (error: any) {
    const responseData = error.response?.data;
    let errorMessage = responseData?.message || 'Terjadi kesalahan tidak diketahui.';
    if (responseData?.errors && Array.isArray(responseData.errors)) {
      const details = responseData.errors.map((err: { field: string; message: string }) => `${err.field}: ${err.message}`).join(', ');
      errorMessage = `${errorMessage}: ${details}`;
    }
    return { success: false, message: errorMessage };
  }
}

export async function createCustomerAction(data: CustomerPayload): Promise<FormState> {
  return handleApiAction(createCustomer(data), 'Pelanggan baru berhasil dibuat.');
}

export async function updateCustomerAction(id: number, data: CustomerPayload): Promise<FormState> {
  if (!data.password) {
    delete data.password;
  }
  return handleApiAction(updateCustomer(id, data), 'Data pelanggan berhasil diperbarui.');
}

export async function deleteCustomerAction(id: number): Promise<FormState> {
  return handleApiAction(deleteCustomer(id), 'Pelanggan berhasil dihapus.');
}
