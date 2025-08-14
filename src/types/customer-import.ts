export interface FailedRow {
  row_number: number;
  data: {
    customer_name: string;
    phone_number: string;
    email: string;
    company_name: string;
    shipping_address_default: string;
    contact_person: string;
    customer_type: string;
  };
  error: string;
}

export interface ImportResponse {
  status: string;
  message: string;
  summary: {
    total_rows: number;
    successfully_imported: number;
    failed_imports: number;
  };
  failed_rows: FailedRow[];
}

export interface ImportResult {
  response: ImportResponse;
  timestamp: number;
}
