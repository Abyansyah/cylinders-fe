export interface Customer {
  id: number;
  user_id: number;
  customer_name: string;
  company_name?: string;
  phone_number: string;
  email: string;
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
}

export interface CustomersApiResponse {
  data: Customer[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
