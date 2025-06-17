'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createCylinderProperty, updateCylinderProperty, deleteCylinderProperty } from '@/services/cylinderPropertyService';
import type { CylinderPropertyPayload } from '@/services/cylinderPropertyService';

type FormState = {
  success: boolean;
  message: string;
};

async function handleApiAction(promise: Promise<any>, successMessage: string): Promise<FormState> {
  try {
    await promise;
    revalidatePath('/cylinder-properties');
    return { success: true, message: successMessage };
  } catch (error: any) {
    const responseData = error.response?.data;
    let errorMessage = responseData?.message || 'An unknown error occurred.';

    if (responseData?.errors && Array.isArray(responseData.errors)) {
      const details = responseData.errors.map((err: { field: string; message: string }) => `${err.field}: ${err.message}`).join(', ');

      errorMessage = `${errorMessage}: ${details}`;
    }

    return { success: false, message: errorMessage };
  }
}

export async function createCylinderPropertyAction(data: CylinderPropertyPayload): Promise<FormState> {
  return handleApiAction(createCylinderProperty(data), 'Cylinder property created successfully.');
}

export async function updateCylinderPropertyAction(id: number, data: CylinderPropertyPayload): Promise<FormState> {
  return handleApiAction(updateCylinderProperty(id, data), 'Cylinder property updated successfully.');
}

export async function deleteCylinderPropertyAction(id: number): Promise<FormState> {
  return handleApiAction(deleteCylinderProperty(id), 'Cylinder property deleted successfully.');
}
