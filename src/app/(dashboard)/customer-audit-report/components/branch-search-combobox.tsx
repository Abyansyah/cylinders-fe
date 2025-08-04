'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getBranches } from '@/services/branchService';
import { Branch } from '@/types/branch';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function BranchSearchCombobox({ value, onChange }: Props) {
  return <GenericSearchCombobox<Branch> value={value} onChange={(val) => onChange(val)} fetcher={getBranches} labelExtractor={(b) => b.name} placeholder="Pilih Cabang..." searchKey="/branches" />;
}
