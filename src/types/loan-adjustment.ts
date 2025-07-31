export interface LoanAdjustment {
  id: number;
  adjustment_number: string;
  customer_name: string;
  adjustment_date: string;
  adjustment_type: 'ADDITION' | 'REMOVAL';
  created_by_user: string;
  total_items: number;
}

export interface LoanAdjustmentFilters {
  customer_id: string;
  adjustment_type: string;
  search: string;
}

export interface LoanAdjustmentDetail {
  id: number;
  adjustment_number: string;
  adjustment_date: string;
  adjustment_type: 'ADDITION' | 'REMOVAL';
  notes: string;
  customer: {
    id: number;
    customer_name: string;
    company_name: string;
  };
  createdBy: {
    id: number;
    name: string;
  };
}
