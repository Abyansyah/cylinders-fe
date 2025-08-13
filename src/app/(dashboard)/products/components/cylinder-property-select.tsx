'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getCylinderPropertiesSelectList } from '@/services/SearchListService';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CylinderProperySelect({ value, onChange }: Props) {
  return <GenericSearchCombobox<any> value={value} onChange={(val) => onChange(val)} fetcher={getCylinderPropertiesSelectList} disableRemoteSearch={true} labelExtractor={(b) => b.name} placeholder="Pilih Jenis Gas..." searchKey="/cylinder-properties" />;
}
