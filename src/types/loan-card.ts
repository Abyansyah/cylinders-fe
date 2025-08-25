export interface LoanCardItem {
  id: number;
  barcode_id: string;
  serial_number: string;
  product_name: string;
  status: string;
  tanggal_kirim: string;
  jumlah_hari: number;
}

export interface LoanCardApiResponse {
  data: LoanCardItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
