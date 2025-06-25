import api from '@/lib/api';
import type { Branch, BranchesApiResponse } from '@/types/branch';
import { cache } from 'react';

export type BranchPayload = Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>;

interface GetBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getBranches = async (params: GetBranchesParams): Promise<BranchesApiResponse> => {
  const { data } = await api.get('/branches', { params });
  return data;
};

export const getBranchById = cache(async (id: number): Promise<Branch> => {
  const { data } = await api.get(`/branches/${id}`);
  return data;
});

export const createBranch = async (payload: BranchPayload): Promise<Branch> => {
  const { data } = await api.post('/branches', payload);
  return data;
};

export const updateBranch = async (id: number, payload: BranchPayload): Promise<Branch> => {
  const { data } = await api.put(`/branches/${id}`, payload);
  return data;
};

export const deleteBranch = async (id: number): Promise<void> => {
  await api.delete(`/branches/${id}`);
};
