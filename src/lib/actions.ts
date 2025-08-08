'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import * as authService from '@/services/authService';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';
import { PERMISSIONS } from '@/config/permissions';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type FormState = {
  message: string;
  success: boolean;
  redirectUrl?: string;
};

function getFirstAccessiblePage(user: any): string {
  const userPermissions = user.role?.permissions?.map((p: any) => p.name);

  if (user.role.role_name === 'Super Admin') {
    const dashboard = SIDEBAR_ITEMS.find((item) => item.url === '/dashboard');
    if (dashboard) return dashboard.url;
  }

  for (const item of SIDEBAR_ITEMS) {
    if (item.items) {
      for (const subItem of item.items) {
        if (subItem.permissionKey) {
          const permissionConfig: any = PERMISSIONS[subItem.permissionKey as keyof typeof PERMISSIONS];
          const requiredPermission = permissionConfig?.view || permissionConfig?.view_all;
          if (userPermissions.includes(requiredPermission)) {
            return subItem.url;
          }
        } else {
          return subItem.url;
        }
      }
    } else if (item.permissionKey) {
      const permissionConfig: any = PERMISSIONS[item.permissionKey as keyof typeof PERMISSIONS];
      const requiredPermission = permissionConfig?.view || permissionConfig?.view_all;
      if (userPermissions.includes(requiredPermission)) {
        return item.url;
      }
    } else if (item.url) {
      return item.url;
    }
  }

  return '/';
}

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

    const user = await authService.getMe();
    const redirectUrl = getFirstAccessiblePage(user);

    revalidatePath('/', 'layout');
    return { message: 'Login successful!', success: true, redirectUrl }; // Kembalikan URL redirect
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'An unknown error occurred.';
    return { message, success: false };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
