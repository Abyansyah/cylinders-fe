export interface FailedRow {
  row_number: number;
  data: {
    barcode_id: string;
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
