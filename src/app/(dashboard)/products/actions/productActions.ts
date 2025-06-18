'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createProduct, updateProduct, deleteProduct } from '@/services/productService';
import type { ProductPayload } from '@/services/productService';

type FormState = {
  success: boolean;
  message: string;
};

async function handleApiAction(promise: Promise<any>, successMessage: string): Promise<FormState> {
  try {
    await promise;
    revalidatePath('/products');
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

export async function createProductAction(data: ProductPayload): Promise<FormState> {
  return handleApiAction(createProduct(data), 'Produk berhasil dibuat.');
}

export async function updateProductAction(id: number, data: ProductPayload): Promise<FormState> {
  return handleApiAction(updateProduct(id, data), 'Produk berhasil diperbarui.');
}

export async function deleteProductAction(id: number): Promise<FormState> {
  return handleApiAction(deleteProduct(id), 'Produk berhasil dihapus.');
}
