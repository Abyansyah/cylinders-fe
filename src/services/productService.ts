import api from '@/lib/api';
import { ImportResponse } from '@/types/customer-import';
import type { Product, ProductsApiResponse } from '@/types/product';
import { cache } from 'react';

export type ProductPayload = {
  name: string;
  sku?: string;
  description?: string;
  is_active: boolean;
  unit?: string;
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

export const importProducts = async (file: File, onUploadProgress: (progress: number) => void): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
      onUploadProgress(percentCompleted);
    },
  });

  return data;
};
