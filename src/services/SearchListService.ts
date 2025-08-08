import api from '@/lib/api';
import { SelectListApiResponse } from '@/types/select-list';

export const getCustomersSelectList = async (params: { search: string }): Promise<SelectListApiResponse> => {
  const { data } = await api.get('/select-lists/customers', { params });
  return data;
};

export const getWarehousesSelectList = async (params: { search: string }): Promise<SelectListApiResponse> => {
  const { data } = await api.get('/select-lists/warehouses', { params });
  return data;
};
