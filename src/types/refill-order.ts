export interface RefillOrder {
  id: number;
  refill_order_number: string;
  supplier_name: string;
  requester_name: string;
  request_date: string;
  status: 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
}

export interface RefillOrderApiResponse {
  data: RefillOrder[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface Supplier {
  id: number;
  name: string;
}

export interface RefillOrderDetail {
  id: number;
  status: string;
  sjNumber: string | null;
  systemNumber: string | null;
  dispatchDate: string;
  vehiclePlateNumber: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: number;
    customer_name: string;
    company_name: string;
  };
  requester: {
    id: number;
    name: string;
  };
  approver: {
    id: number;
    name: string;
  } | null;
  driver: {
    id: number;
    name: string;
  } | null;
  details: {
    id: number;
    cylinder: {
      id: number;
      barcode_id: string;
      serial_number: string;
      status: string;
    };
    product: {
      id: number;
      name: string;
      sku: string;
    };
    isReturned: boolean;
    returnedAt: string | null;
  }[];
}

export interface DeliveryNoteItem {
  item_name: string;
  serial_numbers: string[];
  unit: string;
  quantity: number;
}

export interface DeliveryNoteHeader {
  sj_number: string;
  date: string;
  vehicle_number: string;
  driver_name: string;
  system_number: string;
  supplier: {
    name: string;
    address: string;
  };
}

export interface RefillOrderDeliveryNote {
  header: DeliveryNoteHeader;
  items: DeliveryNoteItem[];
}

export interface CreateRefillOrderItem {
  product_id: number;
  identifiers: string[];
}

export interface CreateRefillOrderRequest {
  supplier_id: number;
  dispatch_date: string;
  items: CreateRefillOrderItem[];
}

export interface RefillOrderItemDetail {
  id: number;
  cylinder: {
    id: number;
    barcode_id: string;
    serial_number: string;
    status: string;
  };
  product: {
    id: number;
    name: string;
    sku: string;
  };
  isReturned: boolean;
  returnedAt: string | null;
}

export interface RefillOrderDetail {
  id: number;
  status: string;
  sjNumber: string | null;
  systemNumber: string | null;
  dispatchDate: string;
  vehiclePlateNumber: string | null;
  createdAt: string;
  updatedAt: string;
  supplier: {
    id: number;
    customer_name: string;
    company_name: string;
  };
  requester: {
    id: number;
    name: string;
  };
  approver: {
    id: number;
    name: string;
  } | null;
  driver: {
    id: number;
    name: string;
  } | null;
  details: RefillOrderItemDetail[];
}

export interface BulkReceiveResponse {
  status: string;
  message: string;
  summary: {
    total_scanned: number;
    successfully_received: number;
    failed_items: number;
  };
  failed_items: Array<{
    identifier: string;
    reason: string;
  }>;
  affected_refill_orders: Array<{
    refill_order_number: string;
    status: string;
  }>;
}

export interface viewSummarySupplierResponse {
  supplier: {
    id: number;
    name: string;
  };
  summary: {
    total_cylinders_sent: number;
    cylinders_returned: number;
    cylinders_outstanding: number;
  };
}
