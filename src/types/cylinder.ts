import { CylinderProperty } from './cylinder-property';
import { GasType } from './gas-type';
import { User } from './user';

export interface Cylinder {
  id: number;
  barcode_id: string;
  serial_number: string;
  cylinder_properties_id: number;
  gas_type_id: number | null;
  warehouse_id: number;
  status: CylinderStatus;
  manufacture_date: string;
  last_fill_date: string | null;
  is_owned_by_customer: boolean;
  notes: string | null;
  customer_id: number | null;
  current_order_item_id: number | null;
  createdAt: string;
  updatedAt: string;
  cylinderProperty: Pick<CylinderProperty, 'id' | 'name' | 'size_cubic_meter' | 'material' | 'max_age_years'>;
  gasType: Pick<GasType, 'id' | 'name' | 'description'>;
  currentWarehouse: {
    name: string;
    address?: string;
  };
  stockMovements?: StockMovement[];
}

export interface CylinderDetail extends Omit<Cylinder, 'cylinderProperty' | 'gasType' | 'currentWarehouse'> {
  cylinder_properties_id: number;
  gas_type_id: number | null;
  warehouse_id: number;
  is_owned_by_customer: boolean;
  notes: string | null;
  customer_id: number | null;
  cylinderProperty: CylinderProperty;
  gasType: GasType | null;
  currentWarehouse: Warehouse;
  stockMovements: StockMovement[];
}

export interface StockMovement {
  id: number;
  movement_type: string;
  notes: string;
  timestamp: string;
  user: Pick<User, 'fullName' | 'username'>;
  fromWarehouse?: Pick<Warehouse, 'name'> | null;
  toWarehouse?: Pick<Warehouse, 'name'> | null;
}

export type CylinderStatus =
  | 'Di Gudang - Kosong'
  | 'Di Gudang - Terisi'
  | 'Dialokasikan Untuk Order'
  | 'Siap Kirim'
  | 'Dalam Pengiriman'
  | 'Di Customer - Sewa'
  | 'Di Customer - Beli'
  | 'Dalam Perjalanan Kembali ke Gudang'
  | 'Perlu Inspeksi'
  | 'Rusak'
  | 'Tidak Aktif';

export interface Warehouse {
  id: number;
  name: string;
  address: string;
}

export interface CreateCylinderRequest {
  barcode_id: string;
  serial_number: string;
  cylinder_properties_id: number;
  gas_type_id: number | null;
  warehouse_id: number;
  status: CylinderStatus;
  manufacture_date: string;
  notes: string;
  last_fill_date: string | null;
}

export interface UpdateCylinderStatusRequest {
  status: CylinderStatus;
  gas_type_id?: number;
  last_fill_date?: string;
  notes: string;
  warehouse_id_param?: number;
}

export interface CylindersApiResponse {
  data: Cylinder[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
