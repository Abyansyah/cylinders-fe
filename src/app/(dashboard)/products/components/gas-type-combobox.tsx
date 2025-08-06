'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getGasTypes } from '@/services/gasTypeService';
import { GasType } from '@/types/gas-type';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function GasTypeSearchCombobox({ value, onChange }: Props) {
  return <GenericSearchCombobox<GasType> value={value} onChange={(val) => onChange(val)} fetcher={getGasTypes} labelExtractor={(b) => b.name} placeholder="Pilih Jenis Gas..." searchKey="/gas-types" />;
}
