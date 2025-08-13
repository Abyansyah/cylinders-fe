'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getGasTypes } from '@/services/gasTypeService';
import { getGasTypeSelectList } from '@/services/SearchListService';
import { GasType } from '@/types/gas-type';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function GasTypeSearchCombobox({ value, onChange }: Props) {
  return <GenericSearchCombobox<any> value={value} onChange={(val) => onChange(val)} fetcher={getGasTypeSelectList} disableRemoteSearch={true} labelExtractor={(b) => b.name} placeholder="Pilih Jenis Gas..." searchKey="/gas-types" />;
}
