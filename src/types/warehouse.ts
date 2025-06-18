export interface Warehouse {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehousesApiResponse {
  data: Warehouse[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
