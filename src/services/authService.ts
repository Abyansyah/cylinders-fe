import api from '@/lib/api';
import type { User } from '@/types/user';

export const login = async (credentials: object) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get('/auth/me');
  return data;
};
