import type { CylinderProperty } from './cylinder-property';
import type { GasType } from './gas-type';

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku?: string;
  is_active: boolean;
  cylinder_properties_id: number;
  gas_type_id: number;
  createdAt: string;
  updatedAt: string;
  cylinderProperty: Pick<CylinderProperty, 'id' | 'name' | 'size_cubic_meter' | 'material' | 'max_age_years' | 'notes'>;
  gasType: Pick<GasType, 'id' | 'name' | 'description'>;
}

export interface ProductsApiResponse {
  data: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
