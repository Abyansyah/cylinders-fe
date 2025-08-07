import api from '@/lib/api';
import { DashboardData } from '@/types/dashboard';

export const getDashboardData = async (): Promise<DashboardData> => {
  const { data } = await api.get('/dashboard');
  return data;
};
