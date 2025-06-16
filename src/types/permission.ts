export interface Permission {
  id: number;
  name: string;
  description: string;
  module?: string;
  action?: string;
}

export interface PermissionApiResponse {
  data: Permission[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
