import api from '@/lib/api';
import { AdvancedReturn, AdvancedReturnCreateRequest, AdvancedReturnCreateResponse, AdvancedReturnListResponse } from '@/types/advanced-return';
import { cache } from 'react';

interface GetAdvancedReturnParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  warehouseId?: string;
}

export const getAdvancedReturns = async (params: GetAdvancedReturnParams): Promise<AdvancedReturnListResponse> => {
  const { data } = await api.get('/advanced-returns', { params });
  return data;
};

export const getAdvancedReturnDetails = cache(async (id: string): Promise<AdvancedReturn> => {
  const { data } = await api.get(`/advanced-returns/${id}`);
  return data;
});

export const createAdvancedReturn = async (payload: AdvancedReturnCreateRequest): Promise<AdvancedReturnCreateResponse> => {
  const { data } = await api.post('/advanced-returns', payload);
  return data;
};
