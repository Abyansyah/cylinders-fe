'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createUser, deleteUser, updateUser } from '@/services/userService';

const baseUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  role_id: z.coerce.number().min(1, 'Role is required'),
  warehouse_id: z.coerce.number().optional(),
  is_active: z.coerce.boolean().optional(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const updateUserSchema = baseUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters long').optional().or(z.literal('')),
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

export async function createUserAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());

  if (rawData.role_id !== '4') {
    delete rawData.warehouse_id;
  }

  const validatedFields = createUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await createUser(validatedFields.data);
  } catch (error: any) {
    return handleApiError(error);
  }

  revalidatePath('/users');
  return { success: true, message: 'User created successfully!' };
}

export async function updateUserAction(id: number, prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());

  if (rawData.role_id !== '4') {
    delete rawData.warehouse_id;
  }

  const validatedFields = updateUserSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check the fields.',
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const dataToUpdate = { ...validatedFields.data };
  if (!dataToUpdate.password) {
    delete dataToUpdate.password;
  }

  try {
    await updateUser(id, dataToUpdate);
  } catch (error: any) {
    return handleApiError(error);
  }

  revalidatePath('/users');
  revalidatePath(`/users/${id}/edit`);
  return { success: true, message: 'User updated successfully!' };
}

export async function deleteUserAction(id: number) {
  try {
    await deleteUser(id);
    revalidatePath('/users');
    return { success: true, message: 'User deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || 'Failed to delete user.' };
  }
}
