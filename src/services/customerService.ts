import api from '@/lib/api';
import type { Customer, CustomersApiResponse, PriceListRequestBody } from '@/types/customer';
import { ImportResponse } from '@/types/customer-import';
import { LoanCardApiResponse } from '@/types/loan-card';
import { cache } from 'react';

export type CustomerPayload = {
  customer_name: string;
  company_name?: string;
  phone_number: string;
  relation_type: 'SUPPLIER' | 'CLIENT' | 'SUPPLIER_AND_CLIENT';
  email: string;
  shipping_address_default: string;
  contact_person: string;
  customer_type: 'Individual' | 'Corporate';
  username: string;
  password?: string;
  is_active: boolean;
};

interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getCustomers = async (params: GetCustomersParams): Promise<CustomersApiResponse> => {
  const { data } = await api.get('/customers', { params });
  return data;
};

export const getCustomerById = cache(async (id: number): Promise<Customer> => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
});

export const createCustomer = async (payload: CustomerPayload): Promise<Customer> => {
  const { data } = await api.post('/customers', payload);
  return data;
};

export const updateCustomer = async (id: number, payload: CustomerPayload): Promise<Customer> => {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

export const importCustomers = async (file: File, onUploadProgress: (progress: number) => void): Promise<ImportResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/customers/import', formData, {
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

export const updateCustomerPriceList = async (customerId: number, payload: PriceListRequestBody[]): Promise<void> => {
  await api.post(`/customers/${customerId}/pricelists`, payload);
};

export const deleteCustomerPriceListItem = async (customerId: number, productId: number): Promise<void> => {
  await api.delete(`/customers/${customerId}/pricelists/${productId}`);
};

export const getCustomerLoanCard = async (customerId: number, params: URLSearchParams): Promise<LoanCardApiResponse> => {
  const { data } = await api.get(`/customers/${customerId}/cylinders`, { params });
  return data;
};
