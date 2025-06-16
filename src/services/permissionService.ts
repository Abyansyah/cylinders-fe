import api from '@/lib/api';
import type { Permission, PermissionApiResponse } from '@/types/permission';

export const getPermissions = async (page = 1, limit = 100): Promise<PermissionApiResponse> => {
  const { data } = await api.get('/permissions', { params: { page, limit } });
  return data;
};

export const fetchAllPermissions = async (): Promise<Permission[]> => {
  let allPermissions: Permission[] = [];
  let currentPage = 1;
  let totalPages = 1;

  do {
    const response = await getPermissions(currentPage, 100);
    allPermissions = allPermissions.concat(response.data);
    totalPages = response.totalPages;
    currentPage++;
  } while (currentPage <= totalPages);

  return allPermissions;
};
