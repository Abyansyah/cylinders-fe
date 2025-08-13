import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getWarehouses } from '@/services/warehouseService';
import { Warehouse } from '@/types/warehouse';

interface Props {
  value: string;
  onChange: (value: string) => void;
  selectedData?: (warehouse: Warehouse) => void;
}

export function WarehouseSearchCombobox({ value, onChange, selectedData }: Props) {
  return (
    <GenericSearchCombobox<any>
      value={value}
      onChange={onChange}
      selectedData={selectedData}
      fetcher={getWarehouses}
      labelExtractor={(w) => w.name}
      placeholder="Pilih Gudang..."
      searchKey="/warehouses"
    />
  );
}
