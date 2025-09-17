interface PriceListProduct {
  id: number;
  name: string;
  unit: string;
}

interface CustomerPriceListItem {
  rentPrice: string | null;
  buyPrice: string | null;
  product: PriceListProduct;
}

export interface Customer {
  id: number;
  user_id: number;
  customer_name: string;
  company_name?: string;
  phone_number: string;
  email: string;
  relation_type?: 'SUPPLIER' | 'CLIENT' | 'SUPPLIER_AND_CLIENT';
  shipping_address_default: string;
  contact_person: string;
  customer_type: 'Individual' | 'Corporate';
  created_by_user_id: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
    username: string;
  };
  userAccount: {
    username: string;
    email: string;
    is_active: boolean;
  };
  pricelists: CustomerPriceListItem[];
  payment_term_days: number | null;
}

export interface CustomerFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  branch_id: number;
  payment_term_days: number | null;
}

export interface CustomersApiResponse {
  data: Customer[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface PriceListRequestBody {
  product_id: number;
  rent_price: number | null;
  buy_price: number | null;
}
