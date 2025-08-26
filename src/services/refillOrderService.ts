import api from '@/lib/api';
import { BulkReceiveResponse, CreateRefillOrderRequest, RefillOrderApiResponse, RefillOrderDeliveryNote, RefillOrderDetail, Supplier, viewSummarySupplierResponse } from '@/types/refill-order';
import { cache } from 'react';

export const getRefillOrders = async (endpoint: string, params: URLSearchParams): Promise<RefillOrderApiResponse> => {
  const { data } = await api.get(endpoint, { params });
  return data;
};

export const getSuppliersForSelect = async (): Promise<{ data: Supplier[] }> => {
  const { data } = await api.get('/select-lists/suppliers');
  return data;
};

export const getRefillOrderById = async (id: number): Promise<RefillOrderDetail> => {
  const { data } = await api.get(`/refill-orders/${id}`);
  return data;
};

export const confirmDispatch = async (id: number, payload: { vehicle_plate_number: string; driver_user_id: number }): Promise<void> => {
  await api.put(`/refill-orders/${id}/confirm-dispatch`, payload);
};

export const getRefillOrderDeliveryNote = cache(async (systemNumber: string): Promise<RefillOrderDeliveryNote> => {
  const { data } = await api.get(`/refill-orders/refill/${systemNumber}`);
  return data;
});

export const createRefillOrder = async (payload: CreateRefillOrderRequest): Promise<any> => {
  const { data } = await api.post('/refill-orders', payload);
  return data;
};

export const receiveRefillOrderItems = async (id: number, payload: { identifiers: string[] }): Promise<any> => {
  const { data } = await api.post(`/refill-orders/${id}/receive`, payload);
  return data;
};

export const cancelRefillOrder = async (id: number): Promise<void> => {
  await api.put(`/refill-orders/${id}/cancel`);
};

export const bulkReceiveFromSupplier = async (payload: { supplier_id: number; warehouse_id?: number; identifiers: string[] }): Promise<BulkReceiveResponse> => {
  const { data } = await api.post('/refill-orders/receive-by-supplier', payload);
  return data;
};

export const viewSummarySuppliers = async (supplier_id: number): Promise<viewSummarySupplierResponse> => {
  const { data } = await api.get(`/refill-orders/summary-by-supplier?supplier_id=${Number(supplier_id)}`);
  return data;
};
