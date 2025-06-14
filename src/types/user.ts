export interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin?: string
  avatar?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  description: string
  module: string
  action: "create" | "read" | "update" | "delete" | "manage"
}
