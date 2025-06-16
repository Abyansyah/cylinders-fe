export interface Role {
  id: number;
  role_name: string;
  permission_count?: string;
  updatedAt?: string;
}

export interface RolesApiResponse {
  data: Role[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
