export interface Supplier {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  contact_person: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliersApiResponse {
  data: Supplier[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export type SupplierPayload = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
