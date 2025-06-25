export interface Branch {
  id: number;
  name: string;
  branch_code: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone_number: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BranchesApiResponse {
  data: Branch[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
