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

export interface DriverDeliveryDetail {
  delivery_id: number;
  delivery_status: 'Menunggu Pickup' | 'Dalam Perjalanan' | 'Selesai' | 'Dibatalkan';
  order_info: {
    order_number: string;
    order_type: string;
    order_date: string;
    order_status: string;
    total_amount: string;
    notes_customer: string | null;
  };
  delivery_info: {
    surat_jalan_number: string;
    tracking_number: string;
    vehicle_number: string;
    shipping_method: string;
    dispatch_time: string;
  };
  customer_info: {
    customer_name: string;
    company_name: string;
    phone_number: string;
    email: string;
    shipping_address: string;
    contact_person: string;
  };
}
