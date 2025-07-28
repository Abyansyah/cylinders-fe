export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  sales_user_id: number;
  assigned_warehouse_id: number;
  order_date: string;
  order_type: 'Sewa' | 'Beli';
  status: string;
  shipping_address: string;
  total_amount: number | null;
  notes_customer: string | null;
  notes_internal: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    customer_name: string;
    company_name: string;
  };
  salesUser: {
    id: number;
    name: string;
  };
  items: OrderItem[];
  history: OrderHistory[];
  delivery: Delivery | null;
}

export interface OrderHistory {
  status: string;
  notes: string;
  timestamp: string;
  user: {
    id: number;
    name: string;
  } | null;
}

export interface Delivery {
  id: number;
  status: string;
  surat_jalan_number: string;
  vehicle_number: string;
  tracking_number: string | null;
  driver: {
    id: number;
    name: string;
    phone_number: string;
    email: string;
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit: 'btl' | 'pcs' | 'unit' | 'lot';
  unit_price: number | null;
  sub_total: number | null;
  is_rental: boolean;
  rental_start_date: string | null;
  rental_end_date: string | null;
  rental_duration_days: number | null;
  notes_petugas_gudang: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface CreateOrderRequest {
  customer_id: number;
  assigned_warehouse_id: number;
  order_type: 'Sewa' | 'Beli';
  notes_customer?: string;
  items: {
    product_id: number;
    quantity: number;
    is_rental: boolean;
    unit: 'btl' | 'pcs' | 'unit' | 'lot';
  }[];
}

export interface OrderStats {
  total_order: number;
  order_aktif: number;
  total_order_sewa: number;
  total_order_beli: number;
}

export interface OrderStatsApiResponse {
  success: boolean;
  message: string;
  data: OrderStats;
}

export interface OrdersApiResponse {
  data: Order[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  order_type?: 'Sewa' | 'Beli' | 'all';
  date_start?: string;
  date_end?: string;
  order_number_search?: string;
  warehouseId?: string;
}

export interface PrepareOrderDetail {
  id: number;
  order_number: string;
  customer_name: string;
  company_name: string;
  order_type: 'Sewa' | 'Beli';
  order_date: string;
  status: string;
  items: PrepareOrderItem[];
}

export interface PrepareOrderItem {
  order_item_id: number;
  product_name: string;
  sku: string;
  required_quantity: number;
  assigned_quantity: number;
  assigned_barcodes: string[];
}
