export interface TTBKListItem {
  id: number;
  ttbk_number: string;
  receipt_date: string;
  status: 'In Transit' | 'Completed';
  total_items: string;
  customer: {
    customer_name: string;
  };
}

export interface TTBKListApiResponse {
  success: boolean;
  data: TTBKListItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateTTBKRequest {
  customer_id: number;
  destination_warehouse_id: number;
  receipt_date: string;
  ttbk_number: string;
  notes?: string;
  barcodes: string[];
}

export interface TTBKDetail {
  id: number;
  ttbk_number: string;
  receipt_date: string;
  status: 'In Transit' | 'Completed';
  notes: string | null;
  customer: {
    id: number;
    customer_name: string;
    company_name: string;
    phone_number: string;
    email: string;
    customer_type: string;
    shipping_address_default: string;
  };
  driver: {
    id: number;
    name: string;
    phone_number: string;
  };
  destinationWarehouse: {
    id: number;
    name: string;
    address: string;
    phone_number: string;
  };
  details: {
    id: number;
    cylinder: {
      id: number;
      barcode_id: string;
    };
    createdAt: string;
  }[];
}
