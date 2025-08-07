export type CylinderStatusOption = 'Di Gudang - Terisi' | 'Di Gudang - Kosong' | 'Perlu Inspeksi';

export interface CylinderStatusUpdateRequest {
  barcodes: string[];
  new_status: CylinderStatusOption;
  gas_type_id?: number;
}

export interface CylinderStatusUpdateResponse {
  message: string;
  summary: {
    total_requested: number;
    successfully_updated: number;
    skipped_no_change: number;
    failed_validation: number;
  };
  skipped_items: {
    barcode_id: string;
    reason: string;
  }[];
  failed_items: {
    barcode_id: string;
    reason: string;
  }[];
  updated_items: {
    barcode_id: string;
    old_status: string;
    new_status: string;
  }[];
}
