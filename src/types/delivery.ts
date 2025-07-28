export interface Driver {
  id: number;
  name: string;
  phone_number: string;
  email: string;
}

export interface DeliveryAssignment {
  order_id: number;
  driver_user_id: number;
  vehicle_number: string;
  shipping_method: 'Dikirim' | 'Diambil Sendiri';
}

export interface DeliveryDocument {
  company_name: string;
  customer_name: string;
  phone_number: string;
  email: string;
  shipping_address_default: string;
  createdAt: string;
  vehicle_number: string;
  tracking_number: string;
  nama_pengemudi: string;
  shipping_method: string;
  surat_jalan_number: string;
  items: DeliveryDocumentItem[];
}

export interface DeliveryDocumentItem {
  no: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit: string;
  serial_numbers: string[];
}
