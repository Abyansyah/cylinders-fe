import api from '@/lib/api';
import type { Product, ProductsApiResponse } from '@/types/product';
import { cache } from 'react';

export type ProductPayload = {
  name: string;
  sku?: string;
  description?: string;
  is_active: boolean;
  cylinder_properties_id: number;
  gas_type_id: number;
};

interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getProducts = async (params: GetProductsParams): Promise<ProductsApiResponse> => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProductById = cache(async (id: number): Promise<Product> => {
  const { data } = await api.get(`/products/${id}`);
  return data;
});

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  const { data } = await api.post('/products', payload);
  return data;
};

export const updateProduct = async (id: number, payload: ProductPayload): Promise<Product> => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};
