import api from '@/lib/api';
import { ManagementTTBKItem } from '@/types/management-ttbk';
import { CreateTTBKRequest, TTBKDetail, TTBKListApiResponse } from '@/types/ttbk';
import { cache } from 'react';

export const getDriverTTBKs = async (url: string): Promise<TTBKListApiResponse> => {
  const { data } = await api.get(url);
  return data;
};

export const createTTBK = async (payload: CreateTTBKRequest): Promise<any> => {
  const { data } = await api.post('/return-receipts', payload);
  return data;
};

export const getTTBKById = cache(async (id: number): Promise<TTBKDetail> => {
  const { data } = await api.get(`/return-receipts/${id}`);
  return data.data;
});

export const getManagementTTBKs = async (params: URLSearchParams): Promise<{ data: ManagementTTBKItem[]; totalPages: number }> => {
  const { data } = await api.get(`/return-receipts?${params.toString()}`);
  return data;
};
