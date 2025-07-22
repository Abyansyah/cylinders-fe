import api from '@/lib/api';
import type { CreateOrderRequest, GetOrdersParams, Order, OrdersApiResponse, OrderStats, OrderStatsApiResponse } from '@/types/order';
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
