export interface GasType {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface GasTypesApiResponse {
  data: GasType[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
