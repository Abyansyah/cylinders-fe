export interface WarehouseStockReportItem {
  warehouse_name: string;
  product_name: string;
  status: string;
  total_stock: string;
  filled_stock: string;
  empty_stock: string;
}

export interface WarehouseStockReportApiResponse {
  data: WarehouseStockReportItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
