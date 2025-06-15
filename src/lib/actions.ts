'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import * as authService from '@/services/authService';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type FormState = {
  message: string;
  success: boolean;
};

export async function loginAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map((e) => e.message).join(', '),
      success: false,
    };
  }

  try {
    const response = await authService.login(validatedFields.data);

    if (!response.token) {
      return { message: 'Login successful, but no token received.', success: false };
    }

    await createSession(response.token);

    revalidatePath('/', 'layout');
    return { message: 'Login successful!', success: true };
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'An unknown error occurred.';
    return { message, success: false };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
