export interface ManagementTTBKItem {
  id: number;
  ttbk_number: string;
  receipt_date: string;
  status: 'In Transit' | 'Completed';
  total_items: string;
  customer: {
    customer_name: string;
  };
  driver: {
    name: string;
  };
  destination_warehouse?: {
    name: string;
  };
}

export interface ManagementTTBKFilters {
  driver_id: string;
  destination_warehouse_id: string;
  status: string;
  ttbk_number: string;
}
