'use server';

import { revalidatePath } from 'next/cache';
import { createBranch, updateBranch, deleteBranch } from '@/services/branchService';
import type { BranchPayload } from '@/services/branchService';

type FormState = {
  success: boolean;
  message: string;
};

async function handleApiAction(promise: Promise<any>, successMessage: string): Promise<FormState> {
  try {
    await promise;
    revalidatePath('/branches');
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

export async function createBranchAction(data: BranchPayload): Promise<FormState> {
  return handleApiAction(createBranch(data), 'Cabang berhasil dibuat.');
}

export async function updateBranchAction(id: number, data: BranchPayload): Promise<FormState> {
  return handleApiAction(updateBranch(id, data), 'Data cabang berhasil diperbarui.');
}

export async function deleteBranchAction(id: number): Promise<FormState> {
  return handleApiAction(deleteBranch(id), 'Cabang berhasil dihapus.');
}
