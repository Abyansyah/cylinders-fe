export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  unit?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  available_stock?: number;
}

export interface ProductsApiResponse {
  data: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
