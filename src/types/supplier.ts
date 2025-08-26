export interface Supplier {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  contact_person: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  pricelists?: SupplierPriceListItem[];
}

export interface SuppliersApiResponse {
  data: Supplier[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface PriceListProduct {
  id: number;
  name: string;
  unit: string;
}

export type SupplierPayload = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;

export interface SupplierPriceListItem {
  buyPrice: string | null;
  product: PriceListProduct;
}

export interface PriceListRequestBody {
  product_id: number;
  rent_price: number | null;
  buy_price: number | null;
}
