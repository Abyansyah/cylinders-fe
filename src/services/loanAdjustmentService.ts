import api from '@/lib/api';
import { LoanAdjustment, LoanAdjustmentDetail } from '@/types/loan-adjustment';
import { cache } from 'react';

export const getLoanAdjustments = async (params: URLSearchParams): Promise<{ data: LoanAdjustment[]; totalPages: number; totalItems: number }> => {
  const { data } = await api.get(`/loans/adjustments?${params.toString()}`);
  return data;
};

export const getLoanAdjustmentById = cache(async (id: number): Promise<LoanAdjustmentDetail> => {
  const { data } = await api.get(`/loans/adjustments/${id}`);
  return data.data;
});

export const addLoanAdjustment = async (payload: any): Promise<void> => {
  await api.post('/loans/adjustments/add', payload);
};

export const removeLoanAdjustment = async (payload: any): Promise<void> => {
  await api.post('/loans/adjustments/remove', payload);
};

export const transferLoan = async (payload: any): Promise<void> => {
  await api.post('/loans/transfer', payload);
};
