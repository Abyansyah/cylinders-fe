export interface CustomerAuditReportItem {
  audit_id: number;
  audit_number: string;
  customer_name: string;
  auditor_name: string;
  branch_name: string;
  audit_date: string;
  status: 'Completed' | 'In Progress' | 'Draft';
  summary: {
    expected: number;
    found: number;
    missing: number;
    unexpected: number;
  };
}

export interface AuditReportFilters {
  auditor_id: string;
  branch_id: string;
  customer_id: string;
  status: string;
}

export interface CustomerAuditReportApiResponse {
  totalItems: number;
  data: CustomerAuditReportItem[];
  totalPages: number;
  currentPage: number;
}
