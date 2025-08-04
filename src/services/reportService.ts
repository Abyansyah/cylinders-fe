import api from '@/lib/api';
import { CustomerAuditReportApiResponse } from '@/types/customer-audit-report';
import { DeliveryReportApiResponse } from '@/types/delivery-report';
import { WarehouseStockReportApiResponse } from '@/types/warehouse-stock-report';

export const getDeliveryReports = async (params: URLSearchParams): Promise<DeliveryReportApiResponse> => {
  const { data } = await api.get(`/reports/deliveries?${params.toString()}`);
  return data;
};

export const getWarehouseStockReports = async (params: URLSearchParams): Promise<WarehouseStockReportApiResponse> => {
  const { data } = await api.get(`/reports/warehouse-stock?${params.toString()}`);
  return data;
};

export const getCustomerAuditReports = async (params: URLSearchParams): Promise<CustomerAuditReportApiResponse> => {
  const { data } = await api.get(`/reports/audits?${params.toString()}`);
  return data;
};
