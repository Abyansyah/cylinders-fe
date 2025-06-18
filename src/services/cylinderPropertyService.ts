import api from '@/lib/api';
import type { CylinderProperty, CylinderPropertiesApiResponse } from '@/types/cylinder-property';
import { cache } from 'react';

export type CylinderPropertyPayload = {
  name: string;
  size_cubic_meter: number;
  material?: string;
  max_age_years: number;
  notes?: string;
};

interface GetCylinderPropertiesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getCylinderProperties = async (params: GetCylinderPropertiesParams): Promise<CylinderPropertiesApiResponse> => {
  const { data } = await api.get('/cylinder-properties', { params });
  return data;
};

export const getCylinderPropertyById =  cache(async (id: number): Promise<CylinderProperty> => {
  const { data } = await api.get(`/cylinder-properties/${id}`);
  return data;
});

export const createCylinderProperty = async (payload: CylinderPropertyPayload): Promise<CylinderProperty> => {
  const { data } = await api.post('/cylinder-properties', payload);
  return data;
};

export const updateCylinderProperty = async (id: number, payload: CylinderPropertyPayload): Promise<CylinderProperty> => {
  const { data } = await api.put(`/cylinder-properties/${id}`, payload);
  return data;
};

export const deleteCylinderProperty = async (id: number): Promise<void> => {
  await api.delete(`/cylinder-properties/${id}`);
};
