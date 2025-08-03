export interface CustomerAudit {
  id: number;
  audit_number: string;
  customer_name: string;
  branch_name: string;
  auditor_name: string;
  audit_date: string;
  status: 'Completed' | 'In Progress' | 'Draft';
  total_items: number;
}

export interface AuditFilters {
  auditor_user_id?: string;
  branch_id?: string;
  customer_id?: string;
  status?: string;
}

export interface CustomerAuditApiResponse {
  totalItems: number;
  data: CustomerAudit[];
  totalPages: number;
  currentPage: number;
}

export interface AuditStats {
  total_audits: number;
  completed_audits: number;
  in_progress_audits: number;
}

export interface CustomerAuditDetail {
  audit_details: {
    id: number;
    audit_number: string;
    status: string;
    pic_name: string;
    pic_division: string;
    pic_signature_url: string;
    customer: {
      customer_name: string;
    };
    branch: {
      name: string;
    };
    auditor: {
      name: string;
    };
  };
  summary: {
    match: number;
    missing: number;
    unexpected: number;
    foreign: number;
  };
  results: {
    MATCH: AuditResultItem[];
    MISSING: AuditResultItem[];
    UNEXPECTED: AuditResultItem[];
    FOREIGN: AuditResultItem[];
  };
}

export interface AuditResultItem {
  detail_id?: number;
  scanned_barcode: string;
  finding_status: 'MATCH' | 'MISSING' | 'UNEXPECTED' | 'FOREIGN';
  notes?: string;
  cylinder_details: {
    id: number;
    serial_number: string;
  } | null;
}

export interface CreateAuditData {
  customer_id: number;
  branch_id: number;
  notes: string;
}

export interface CreateAuditResponse {
  audit_details: {
    id: number;
    audit_number: string;
  };
}

export interface AuditScanData {
  audit_details: {
    id: number;
    audit_number: string;
    customer: {
      customer_name: string;
    };
    branch: {
      name: string;
    };
  };
  expected_cylinders: {
    id: number;
    barcode_id: string;
    serial_number: string;
  }[];
  scanned_items: ScannedItem[];
}

export interface ScannedItem {
  detail_id: number;
  scanned_barcode: string;
  finding_status: 'MATCH' | 'MISSING' | 'UNEXPECTED' | 'FOREIGN';
  cylinder_details: {
    id: number;
    serial_number: string;
  } | null;
}

export interface CompleteAuditData {
  pic_name: string;
  pic_division: string;
  pic_signature: string;
}
