export interface CylinderProperty {
  id: number;
  name: string;
  size_cubic_meter: string;
  material: string;
  max_age_years: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CylinderPropertiesApiResponse {
  data: CylinderProperty[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
