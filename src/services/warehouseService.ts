import api from '@/lib/api';
import type { Warehouse, WarehousesApiResponse } from '@/types/warehouse';
import { cache } from 'react';

export type WarehousePayload = Pick<Warehouse, 'name' | 'address' | 'phone_number'>;

interface GetWarehousesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getWarehouses = async (params: GetWarehousesParams): Promise<WarehousesApiResponse> => {
  const { data } = await api.get('/warehouses', { params });
  return data;
};

export const getWarehouseById = cache(async (id: number): Promise<Warehouse> => {
  const { data } = await api.get(`/warehouses/${id}`);
  return data;
});

export const createWarehouse = async (payload: WarehousePayload): Promise<Warehouse> => {
  const { data } = await api.post('/warehouses', payload);
  return data;
};

export const updateWarehouse = async (id: number, payload: WarehousePayload): Promise<Warehouse> => {
  const { data } = await api.put(`/warehouses/${id}`, payload);
  return data;
};

export const deleteWarehouse = async (id: number): Promise<void> => {
  await api.delete(`/warehouses/${id}`);
};
