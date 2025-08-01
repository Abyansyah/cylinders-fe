export interface DeliveryReportItem {
  delivery_id: number;
  surat_jalan_number: string;
  order_number: string;
  customer_name: string;
  driver_name: string;
  vehicle_number: string;
  shipping_method: string;
  dispatch_time: string;
  completion_time: string;
  status: 'Menunggu Pickup' | 'Selesai';
  order_id: number;
}

export interface DeliveryReportApiResponse {
  data: DeliveryReportItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
