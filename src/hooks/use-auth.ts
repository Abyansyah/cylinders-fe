'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { getMe } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { fetcher } from '@/lib/api';

const SESSION_COOKIE_NAME = 'session_token';

export function useAuth() {
  const { user, setUser } = useAuthStore();

  const hasToken = !!Cookies.get(SESSION_COOKIE_NAME);

  const { data, error, isLoading } = useSWR(hasToken ? '/auth/me' : null, fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (data) {
      setUser(data.user);
    }
  }, [data, setUser]);

  return {
    user,
    isLoading,
    isError: error,
    isLoggedIn: !!user,
  };
}
