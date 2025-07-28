export interface DriverDelivery {
  id: number;
  order_id: number;
  driver_user_id: number;
  assigned_by_user_id: number;
  vehicle_number: string;
  status: 'Menunggu Pickup' | 'Dalam Perjalanan' | 'Selesai' | 'Dibatalkan';
  dispatch_time: string | null;
  completion_time: string | null;
  notes_driver: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: number;
    order_number: string;
    shipping_address: string;
    customer: {
      customer_name: string;
      phone_number: string;
    };
  };
  surat_jalan_number: string;
}
