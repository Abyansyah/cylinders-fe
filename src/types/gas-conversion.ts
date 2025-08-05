export interface GasConversion {
  id: number;
  request_number: string;
  packaging_type: string;
  from_product_id: number;
  to_product_id: number;
  quantity: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_COMPLETED' | 'COMPLETED';
  requester_user_id: number;
  approver_user_id: number | null;
  assigned_warehouse_id: number | null;
  fulfilled_quantity: number;
  request_date: string;
  approval_date: string | null;
  notes: string;
  fromProduct: {
    name: string;
  };
  toProduct: {
    name: string;
  };
  requester: {
    name: string;
  };
  approver: {
    name: string;
  } | null;
  assignedWarehouse: {
    name: string;
  } | null;
}

export interface GasConversionApiResponse {
  success: boolean;
  totalItems: number;
  data: GasConversion[];
  totalPages: number;
  currentPage: number;
}

export interface ApprovalRequest {
  assigned_warehouse_id?: number;
  notes: string;
}

export interface ReassignWarehouseRequest {
  new_warehouse_id: number;
  notes: string;
}

export interface GasConversionRequest {
  packaging_type: string;
  from_product_id: number;
  to_product_id: number;
  quantity: number;
  notes: string;
}
export interface WarehouseTaskApiResponse {
  success: boolean;
  data: GasConversion[];
}

export interface BarcodeSubmission {
  barcodes: string[];
}

export interface GasConversionDetail {
  request_header: {
    id: number;
    request_number: string;
    status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_COMPLETED' | 'COMPLETED';
    request_date: string;
    packaging_type: string;
    from_product: {
      id: number;
      name: string;
    };
    to_product: {
      id: number;
      name: string;
    };
    quantity_requested: number;
    quantity_fulfilled: number;
    requester_name: string;
    approval_details: {
      approver_name: string;
      approval_date: string;
      notes: string;
    } | null;
    execution_warehouse: {
      id: number;
      name: string;
    } | null;
    notes: string;
  };
  execution_details: Array<{
    cylinder_id: number;
    barcode_id: string;
    serial_number: string;
    executed_by_name: string;
    executed_at: string;
  }>;
}
