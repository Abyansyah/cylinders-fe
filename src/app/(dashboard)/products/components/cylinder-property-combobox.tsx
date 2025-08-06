'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getCylinderProperties } from '@/services/cylinderPropertyService';
import { CylinderProperty } from '@/types/cylinder-property';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function CylinderPropertySearchCombobox({ value, onChange }: Props) {
  return <GenericSearchCombobox<CylinderProperty> value={value} onChange={(val) => onChange(val)} fetcher={getCylinderProperties} labelExtractor={(b) => b.name} placeholder="Pilih Tabung Gas..." searchKey="/cylinder-properties" />;
}
