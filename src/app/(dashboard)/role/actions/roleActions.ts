'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createRole, deleteRole, syncRolePermissions, updateRole } from '@/services/roleService';

const roleSchema = z.object({
  role_name: z.string().min(3, 'Role name must be at least 3 characters long'),
});

export type FormState = {
  message: string;
  success: boolean;
  errors?: Record<string, string[] | undefined>;
};

const handleApiError = (error: any): FormState => {
  const responseData = error.response?.data;
  if (responseData && responseData.errors && Array.isArray(responseData.errors)) {
    const errorMessages = responseData.errors.map((err: { field: string; message: string }) => `${err.field}: ${err.message}`).join('\n');
    return {
      message: `${responseData.message || 'An error occurred.'}\n${errorMessages}`,
      success: false,
    };
  }

  return {
    message: responseData?.message || 'An unknown error occurred.',
    success: false,
  };
};

export async function createRoleAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = roleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await createRole(validatedFields.data);
  } catch (error: any) {
    return handleApiError(error);
  }

  revalidatePath('/role');
  return { success: true, message: 'Role created successfully!' };
}

export async function updateRoleAction(id: number, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = roleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updateRole(id, validatedFields.data);
  } catch (error: any) {
    return handleApiError(error);
  }

  revalidatePath('/role');
  revalidatePath(`/role/${id}/edit`);
  return { success: true, message: 'Role updated successfully!' };
}

export async function deleteRoleAction(id: number) {
  try {
    await deleteRole(id);
    revalidatePath('/role');
    return { success: true, message: 'Role deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete role.' };
  }
}

export async function syncPermissionsAction(roleId: number, permissionIds: number[]): Promise<FormState> {
  try {
    await syncRolePermissions(roleId, permissionIds);
    revalidatePath('/role');
    revalidatePath(`/role/${roleId}/permissions`);

    return { success: true, message: 'Permissions updated successfully!' };
  } catch (error: any) {
    console.error('Sync Permission Error:', error);
    return {
      success: false,
      message: error?.response?.data?.message || 'Failed to update permissions.',
    };
  }
}
