import api from '@/lib/api';
import type { Supplier, SuppliersApiResponse, SupplierPayload } from '@/types/supplier';
import { cache } from 'react';

interface GetSuppliersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getSuppliers = async (params: GetSuppliersParams): Promise<SuppliersApiResponse> => {
  const { data } = await api.get('/suppliers', { params });
  return data;
};

export const getSupplierById = cache(async (id: number): Promise<Supplier> => {
  const { data } = await api.get(`/suppliers/${id}`);
  return data;
});

export const createSupplier = async (payload: SupplierPayload): Promise<Supplier> => {
  const { data } = await api.post('/suppliers', payload);
  return data;
};

export const updateSupplier = async (id: number, payload: SupplierPayload): Promise<Supplier> => {
  const { data } = await api.put(`/suppliers/${id}`, payload);
  return data;
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};
