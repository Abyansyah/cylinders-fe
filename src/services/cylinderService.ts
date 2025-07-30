import api from '@/lib/api';
import type { Cylinder, CylindersApiResponse, CylinderDetail } from '@/types/cylinder';
import { cache } from 'react';
import { GasType } from '@/types/gas-type';
import { format } from 'date-fns';
import { CylinderForReplacement } from '@/types/replacement-barcode';

export type CylinderCreatePayload = {
  barcode_id: string;
  serial_number: string;
  cylinder_properties_id: number;
  gas_type_id: number | null;
  warehouse_id: number;
  status: string;
  manufacture_date: string;
  notes?: string;
  last_fill_date?: string | null;
};

export type CylinderStatusUpdatePayload = {
  status: string;
  gas_type_id?: number | null;
  last_fill_date?: string | null;
  notes?: string;
};

interface GetCylindersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  warehouseId?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export const getCylinders = async (params: GetCylindersParams): Promise<CylindersApiResponse> => {
  const { data } = await api.get('/cylinders', { params });
  return data;
};

export const checkBarcodeExists = async (barcode: string): Promise<{ existing: boolean }> => {
  const { data } = await api.get(`/cylinders/check-exists/${barcode}`);
  return data;
};

export const createCylinder = async (payload: CylinderCreatePayload): Promise<Cylinder> => {
  const { data } = await api.post('/cylinders', payload);
  return data;
};

export const updateCylinderStatus = async (id: number, payload: CylinderStatusUpdatePayload): Promise<Cylinder> => {
  const { data } = await api.put(`/cylinders/${id}/status`, payload);
  return data;
};

export const getCylinderDetailsByBarcode = cache(async (barcode: string): Promise<CylinderDetail> => {
  const { data } = await api.get(`/cylinders/details/${barcode}`);
  return data;
});

export const getValidGasTypes = async (cylinderPropertiesId: number): Promise<ApiResponse<GasType[]>> => {
  const response = await api.get(`/cylinders/valid-gases?cylinder_properties_id=${cylinderPropertiesId}`);
  return response.data;
};

export const exportCylinderHistory = async (cylinderId: number, formatType: 'pdf' | 'xlsx', fileName: string) => {
  const response = await api.get(`/cylinders/export-history/${cylinderId}?format=${formatType}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;

  const extension = formatType === 'pdf' ? 'pdf' : 'excel';
  const fullFileName = `${fileName}_${format(new Date(), 'yyyyMMdd_HHmm')}.${extension}`;

  link.setAttribute('download', fullFileName);
  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getCylinderForReplacement = async (serialNumber: string): Promise<CylinderForReplacement> => {
  const { data } = await api.get(`/cylinders/detail-replacement/${serialNumber}`);
  return data;
};

export const replaceBarcode = async (payload: { serial_number: string; new_barcode_id: string }): Promise<void> => {
  await api.put('/cylinders/replace-barcode', payload);
};
