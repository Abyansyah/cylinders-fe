'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getUsers } from '@/services/userService';
import { ApiUser } from '@/types/user';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AuditorSearchCombobox({ value, onChange }: Props) {
  return <GenericSearchCombobox<ApiUser> value={value} onChange={(val) => onChange(val)} fetcher={getUsers} labelExtractor={(u) => u.name} placeholder="Pilih Auditor..." searchKey="/users" />;
}
