export interface CylinderForReplacement {
  id: number;
  serial_number: string;
  barcode_id: string;
  cylinder_properties_id: number;
  warehouse_id: number;
  status: string;
  manufacture_date: string;
  gas_type_id: number | null;
  last_fill_date: string | null;
  cylinderProperty: {
    name: string;
  };
  gasType: {
    name: string;
  } | null;
  currentWarehouse: {
    name: string;
  };
  notes?: string;
}
