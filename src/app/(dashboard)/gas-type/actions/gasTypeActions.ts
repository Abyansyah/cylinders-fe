'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createGasType, deleteGasType, updateGasType } from '@/services/gasTypeService';

const formSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
});

type FormState = {
  success: boolean;
  message: string;
};

async function handleApiAction(promise: Promise<any>, successMessage: string): Promise<FormState> {
  try {
    await promise;
    revalidatePath('/gas-type');
    return { success: true, message: successMessage };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'An unknown error occurred.' };
  }
}

export async function createGasTypeAction(data: z.infer<typeof formSchema>): Promise<FormState> {
  return handleApiAction(createGasType(data), 'Gas type created successfully.');
}

export async function updateGasTypeAction(id: number, data: z.infer<typeof formSchema>): Promise<FormState> {
  return handleApiAction(updateGasType(id, data), 'Gas type updated successfully.');
}

export async function deleteGasTypeAction(id: number): Promise<FormState> {
  return handleApiAction(deleteGasType(id), 'Gas type deleted successfully.');
}
