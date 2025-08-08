import useSWR from 'swr';
import { getMe } from '@/services/authService';

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<any>('/auth/me', getMe, {
    shouldRetryOnError: (err) => {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        return false;
      }
      return true;
    },
    revalidateOnFocus: false,
  });

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}
