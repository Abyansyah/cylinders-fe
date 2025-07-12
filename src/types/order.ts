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

export interface ProductStock {
  product_id: number;
  warehouse_id: number;
  available_stock: number;
}

export interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: string;
}

export interface Warehouse {
  id: number;
  name: string;
  address: string;
  manager_name: string;
}
