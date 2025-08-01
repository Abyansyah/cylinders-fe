import api from '@/lib/api';
import { DeliveryReportApiResponse } from '@/types/delivery-report';

export const getDeliveryReports = async (params: URLSearchParams): Promise<DeliveryReportApiResponse> => {
  const { data } = await api.get(`/reports/deliveries?${params.toString()}`);
  return data;
};
