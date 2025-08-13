'use client';

import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getCustomers } from '@/services/customerService';
import { Customer } from '@/types/customer';

interface Props {
  value: string;
  onChange: (value: string) => void;
  selectedData?: (customer: Customer) => void;
}

export function CustomerSearchCombobox({ value, onChange, selectedData }: Props) {
  return (
    <GenericSearchCombobox<any>
      value={value}
      onChange={onChange}
      selectedData={selectedData}
      fetcher={getCustomers}
      labelExtractor={(c) => c.customer_name}
      descriptionExtractor={(c) => c.company_name || 'Individu'}
      placeholder="Pilih Customer..."
      searchKey="/customers"
    />
  );
}
