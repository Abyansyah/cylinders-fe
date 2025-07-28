import api from '@/lib/api';
import { Driver } from '@/types/delivery';
import { Role } from '@/types/role';
import { ApiUser, UsersApiResponse } from '@/types/user';
import { Warehouse } from '@/types/warehouse';
import { cache } from 'react';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number;
  is_active?: boolean;
}

export const getUsers = async (params: GetUsersParams): Promise<UsersApiResponse> => {
  const { data } = await api.get('/users', {
    params,
  });
  return data;
};

export const getUserById = cache(async (id: number): Promise<ApiUser> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
});

export const createUser = async (userData: any): Promise<ApiUser> => {
  const { data } = await api.post('/users', userData);
  return data;
};

export const updateUser = async (id: number, userData: any): Promise<ApiUser> => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getRoles = async (): Promise<Role[]> => {
  const { data } = await api.get('/roles/selection');
  return data.data;
};

export const getWarehouses = async (): Promise<Warehouse[]> => {
  const { data } = await api.get('/warehouses');
  return data.data;
};

export const getDrivers = async (): Promise<{ data: Driver[] }> => {
  const { data } = await api.get('/users/drivers');
  return data;
};
