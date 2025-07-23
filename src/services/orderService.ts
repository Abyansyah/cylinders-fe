import api from '@/lib/api';
import type { CreateOrderRequest, GetOrdersParams, Order, OrdersApiResponse, OrderStats, OrderStatsApiResponse, PrepareOrderDetail } from '@/types/order';
import { cache } from 'react';

/**
 * @returns
 */
export const getOrderStats = async (): Promise<OrderStats> => {
  const { data } = await api.get<OrderStatsApiResponse>('/orders/stats');
  return data.data;
};

/**
 * @param params
 * @returns
 */
export const getOrders = async (params: GetOrdersParams): Promise<OrdersApiResponse> => {
  const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== null && v !== '' && v !== 'all'));
  const { data } = await api.get<OrdersApiResponse>('/orders', { params: cleanParams });
  return data;
};

/**
 * @param payload
 * @returns
 */
export const createOrder = async (payload: CreateOrderRequest): Promise<Order> => {
  const { data } = await api.post('/orders', payload);
  return data;
};

/**
 * @param warehouseId
 * @returns
 */
export const getProductsByWarehouse = async (warehouseId: number) => {
  const { data } = await api.get(`/products?warehouse_id=${warehouseId}`);
  return data;
};

/**
 * @param id
 * @returns
 */
export const getOrderById = cache(async (id: number): Promise<Order> => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
});

/**
 * @param id
 * @param notes
 * @returns
 */
export const cancelOrder = async (id: number, notes: string): Promise<void> => {
  const { data } = await api.put(`/orders/${id}/cancel`, { notes });
  return data;
};

/**
 * @param url
 * @returns
 */
export const getOrdersToPrepare = async (url: string) => {
  const { data } = await api.get(url);
  return data;
};

export const getPrepareOrderDetails = cache(async (id: number): Promise<PrepareOrderDetail> => {
  const { data } = await api.get(`/orders/warehouse/orders/${id}/prepare-details`);
  return data;
});

export const validateCylinderForOrderItem = async (orderItemId: number, barcode: string): Promise<{ isValid: boolean; message: string }> => {
  const { data } = await api.post(`/orders/warehouse/order-items/${orderItemId}/validate-cylinder`, { barcode });
  return data;
};

export const assignAllCylinders = async (orderId: number, payload: { assignments: { order_item_id: number; barcode_ids: string[] }[]; notes_petugas_gudang: string }): Promise<void> => {
  const { data } = await api.post(`/orders/warehouse/orders/${orderId}/assign-all-cylinders`, payload);
  return data;
};

export const markOrderAsPrepared = async (orderId: number): Promise<void> => {
  const { data } = await api.put(`/orders/warehouse/orders/${orderId}/mark-prepared`);
  return data;
};

export const unassignAllCylinders = async (orderId: number): Promise<void> => {
  const { data } = await api.put(`/orders/warehouse/orders/${orderId}/unassign-all`);
  return data;
};
