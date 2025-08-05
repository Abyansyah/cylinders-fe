import api from '@/lib/api';
import { GasConversionApiResponse, ApprovalRequest, ReassignWarehouseRequest, GasConversionRequest, WarehouseTaskApiResponse, BarcodeSubmission, GasConversion, GasConversionDetail } from '@/types/gas-conversion';
import { cache } from 'react';

export const getGasConversions = async (params: URLSearchParams): Promise<GasConversionApiResponse> => {
  const { data } = await api.get(`/gas-conversions?${params.toString()}`);
  return data;
};

export const approveGasConversion = async (id: number, payload: ApprovalRequest): Promise<void> => {
  await api.put(`/gas-conversions/${id}/approve`, payload);
};

export const rejectGasConversion = async (id: number, payload: { notes: string }): Promise<void> => {
  await api.put(`/gas-conversions/${id}/reject`, payload);
};

export const reassignWarehouse = async (id: number, payload: ReassignWarehouseRequest): Promise<void> => {
  await api.put(`/gas-conversions/${id}/reassign-warehouse`, payload);
};

export const createGasConversion = async (payload: GasConversionRequest): Promise<void> => {
  await api.post('/gas-conversions', payload);
};

export const getWarehouseTasks = async (): Promise<WarehouseTaskApiResponse> => {
  const { data } = await api.get('/gas-conversions/warehouse/approved-tasks');
  return data;
};

export const getGasConversionById = cache(async (id: number): Promise<GasConversion> => {
  const { data } = await api.get(`/gas-conversions/${id}`);
  return data.data;
});

export const executeGasConversion = async (id: number, payload: BarcodeSubmission): Promise<void> => {
  await api.post(`/gas-conversions/${id}/execute`, payload);
};

export const getGasConversionDetail = cache(async (id: number): Promise<{ data: GasConversionDetail }> => {
  const { data } = await api.get(`/gas-conversions/${id}`);
  return data;
});
