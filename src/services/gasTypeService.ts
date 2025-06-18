import api from '@/lib/api';
import type { GasType, GasTypesApiResponse } from '@/types/gas-type';
import { cache } from 'react';

type GasTypePayload = Pick<GasType, 'name' | 'description'>;

interface GetGasTypesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getGasTypes = async (params: GetGasTypesParams): Promise<GasTypesApiResponse> => {
  const { data } = await api.get('/gas-types', { params });
  return data;
};

export const getGasTypeById = cache(async (id: number): Promise<GasType> => {
  const { data } = await api.get(`/gas-types/${id}`);
  return data;
});

export const createGasType = async (payload: GasTypePayload): Promise<GasType> => {
  const { data } = await api.post('/gas-types', payload);
  return data;
};

export const updateGasType = async (id: number, payload: GasTypePayload): Promise<GasType> => {
  const { data } = await api.put(`/gas-types/${id}`, payload);
  return data;
};

export const deleteGasType = async (id: number): Promise<void> => {
  await api.delete(`/gas-types/${id}`);
};
