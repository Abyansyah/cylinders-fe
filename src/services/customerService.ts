import api from '@/lib/api';
import type { Customer, CustomersApiResponse } from '@/types/customer';
import { cache } from 'react';

export type CustomerPayload = {
  customer_name: string;
  company_name?: string;
  phone_number: string;
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
