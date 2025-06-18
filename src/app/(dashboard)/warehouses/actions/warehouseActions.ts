'use server';

import { revalidatePath } from 'next/cache';
import { createWarehouse, updateWarehouse, deleteWarehouse } from '@/services/warehouseService';
import type { WarehousePayload } from '@/services/warehouseService';

type FormState = {
  success: boolean;
  message: string;
};

async function handleApiAction(promise: Promise<any>, successMessage: string): Promise<FormState> {
  try {
    await promise;
    revalidatePath('/warehouses');
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

export async function createWarehouseAction(data: WarehousePayload): Promise<FormState> {
  return handleApiAction(createWarehouse(data), 'Gudang berhasil dibuat.');
}

export async function updateWarehouseAction(id: number, data: WarehousePayload): Promise<FormState> {
  return handleApiAction(updateWarehouse(id, data), 'Gudang berhasil diperbarui.');
}

export async function deleteWarehouseAction(id: number): Promise<FormState> {
  return handleApiAction(deleteWarehouse(id), 'Gudang berhasil dihapus.');
}
