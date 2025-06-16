export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface UserRole {
  id: number;
  role_name: string;
}

export interface Warehouse {
  id: number;
  name: string;
}

export interface ApiUser {
  id: number;
  username: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  avatar?: string;
  warehouse?: Warehouse | null;
}

export interface UsersApiResponse {
  data: ApiUser[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface UserData {
  user: User;
}
