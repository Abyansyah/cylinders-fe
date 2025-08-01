export interface WarehouseStockReportItem {
  warehouse_name: string;
  product_name: string;
  status: string;
  stock_count: string;
}

export interface WarehouseStockReportApiResponse {
  data: WarehouseStockReportItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
