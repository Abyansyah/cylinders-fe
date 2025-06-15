'use server';

import { cookies } from 'next/headers';
import type { User } from '@/types/user';

interface Session {
  token: string;
  user?: User;
}

const SESSION_COOKIE_NAME = 'session_token';

export async function createSession(token: string) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return { token };
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
