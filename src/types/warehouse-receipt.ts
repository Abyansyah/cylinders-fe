export interface WarehouseReceiptItem {
  id: number;
  ttbk_number: string;
  receipt_date: string;
  status: 'In Transit' | 'Completed';
  cylinder_count: string;
  notes: string | null;
  driver: {
    name: string;
  };
  customer: {
    customer_name: string;
  };
}

export interface ReceiptNotes {
  itemId: number;
  notes: string;
}

export interface WarehouseReceiptApiResponse {
  success: boolean;
  data: WarehouseReceiptItem[];
}
