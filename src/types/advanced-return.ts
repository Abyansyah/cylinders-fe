export interface AdvancedReturn {
  id: number;
  return_number: string;
  customer_id: number;
  warehouse_id: number;
  pickup_type: 'COMPLAIN_CLAIM' | 'RETURN_UNUSED';
  return_date: string;
  notes: string;
  created_at: string;
  updated_at: string;
  total_items: string;
  customer: {
    id: number;
    customer_name: string;
    company_name?: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  details?: AdvancedReturnDetail[];
}

export interface AdvancedReturnDetail {
  id: number;
  advanced_return_id: number;
  cylinder_id: number;
  initial_status: string;
  reason: string;
  created_at: string;
  updated_at: string;
  cylinder: {
    id: number;
    barcode_id: string;
    serial_number: string;
    status: string;
    product: {
      name: string;
    };
  };
}

export interface AdvancedReturnCreateRequest {
  customer_id: number;
  warehouse_id: number;
  return_date: Date | undefined;
  pickup_type: 'COMPLAIN_CLAIM' | 'RETURN_UNUSED';
  notes: string;
  items: AdvancedReturnItem[];
}

export interface AdvancedReturnItem {
  identifier: string;
  status?: string;
  reason: string;
}

export interface AdvancedReturnCreateResponse {
  message: string;
  data: {
    return_number: string;
    processed_items: number;
    failed_items_count: number;
    failed_items: any[];
  };
}

export interface AdvancedReturnListResponse {
  data: AdvancedReturn[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface AdvancedReturnDetailResponse {
  data: AdvancedReturn;
}
