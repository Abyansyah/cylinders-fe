import api from '@/lib/api';
import { AuditScanData, AuditStats, CompleteAuditData, CreateAuditData, CreateAuditResponse, CustomerAuditApiResponse, CustomerAuditDetail } from '@/types/customer-audit';

export const getAudits = async (params: URLSearchParams): Promise<CustomerAuditApiResponse> => {
  const { data } = await api.get(`/audits?${params.toString()}`);
  return data;
};

export const getAuditStats = async (): Promise<{ data: AuditStats }> => {
  const { data } = await api.get('/audits/stats');
  return data;
};

export const getAuditById = async (id: number): Promise<CustomerAuditDetail> => {
  const { data } = await api.get(`/audits/${id}/results`);
  return data;
};

export const createAudit = async (payload: CreateAuditData): Promise<CreateAuditResponse> => {
  const { data } = await api.post('/audits', payload);
  return data;
};

export const getAuditForScan = async (id: number): Promise<AuditScanData> => {
  const { data } = await api.get(`/audits/${id}`);
  return data;
};

export const scanAuditBarcode = async (id: number, payload: { barcode_id: string }): Promise<void> => {
  await api.post(`/audits/${id}/scan`, payload);
};

export const deleteScannedItem = async (auditId: number, detailId: number): Promise<void> => {
  await api.delete(`/audits/${auditId}/scans/${detailId}`);
};

export const completeAudit = async (id: number, payload: CompleteAuditData): Promise<void> => {
  await api.put(`/audits/${id}/complete`, payload);
};
