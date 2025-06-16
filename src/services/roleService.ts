import api from '@/lib/api';
import type { Role, RolesApiResponse } from '@/types/role';

interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getRoles = async (params: GetRolesParams): Promise<RolesApiResponse> => {
  const { data } = await api.get('/roles', { params });
  return data;
};

export const getRoleById = async (id: number): Promise<Role> => {
  const { data } = await api.get(`/roles/${id}`);
  return data;
};

export const createRole = async (roleData: any): Promise<Role> => {
  const { data } = await api.post('/roles', roleData);
  return data;
};

export const updateRole = async (id: number, roleData: any): Promise<Role> => {
  const { data } = await api.put(`/roles/${id}`, roleData);
  return data;
};

export const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/roles/${id}`);
};

export const syncRolePermissions = async (id: number, permissionIds: number[]): Promise<void> => {
  await api.put(`/roles/${id}/permissions`, { permissionIds });
};
