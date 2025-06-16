'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { authStatus, setUser, setAuthStatus } = useAuthStore();
  const { user, isLoading, error } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      if (authStatus !== 'loading') {
        console.log('AuthProvider: SWR is loading, setting status to loading.');
        setAuthStatus('loading');
      }
      return;
    }

    if (error) {
      setAuthStatus('unauthenticated');
      setUser(null);
      if (!pathname.startsWith('/login')) {
        router.push('/login');
      }
      return;
    }

    if (user) {
      if (authStatus !== 'authenticated') {
        console.log('AuthProvider: SWR returned user, setting status to authenticated.');
        setAuthStatus('authenticated');
        setUser(user);
      }
    }
  }, [user, isLoading, error, setAuthStatus, setUser, pathname, router]);

  if (authStatus === 'loading') {
    return null;
  }

  return <>{children}</>;
}
