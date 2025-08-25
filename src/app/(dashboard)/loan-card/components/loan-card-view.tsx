'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCustomersSelectList } from '@/services/SearchListService';
import { getCustomerLoanCard } from '@/services/customerService';
import { DataTable } from '@/components/ui/data-table/data-table';
import { columns } from './columns';
import { LoanCardItem } from '@/types/loan-card';
import { CustomerSearchCombobox } from '../../loan-adjustments/components/customer-search-combobox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoanCardView() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  const canFetchCylinders = !!selectedCustomerId;

  const params = new URLSearchParams();
  params.append('page', (pagination.pageIndex + 1).toString());
  params.append('limit', pagination.pageSize.toString());
  if (debouncedGlobalFilter) {
    params.append('search', debouncedGlobalFilter);
  }
  if (statusFilter !== 'Semua') {
    params.append('status', statusFilter);
  }

  const { data: cylindersResponse, isLoading: isLoadingCylinders } = useSWR(canFetchCylinders ? [`/customers/${selectedCustomerId}/cylinders`, params.toString()] : null, () => getCustomerLoanCard(Number(selectedCustomerId), params));

  const pageCount = cylindersResponse?.totalPages ?? 0;
  const data: LoanCardItem[] = cylindersResponse?.data ?? [];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kartu Pinjaman Relasi</h1>
          <p className="text-muted-foreground">Lacak tabung yang sedang dipinjam atau dibeli oleh pelanggan.</p>
        </div>

        <Card className="my-4">
          <CardHeader>
            <CardTitle>Pilih Pelanggan</CardTitle>
            <CardDescription>Pilih pelanggan untuk melihat daftar tabung yang mereka pinjam atau beli.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerSearchCombobox value={selectedCustomerId?.toString() || ''} onChange={setSelectedCustomerId} />
          </CardContent>
        </Card>

        {selectedCustomerId && (
          <Card className="my-4">
            <CardHeader>
              <CardTitle> Filter Kartu Pinjaman</CardTitle>
              <CardDescription>Filter kartu pinjaman berdasarkan status dan kata kunci pencarian.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-col gap-2 md:w-80">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semua">Semua</SelectItem>
                        <SelectItem value="Sewa">Dipinjam</SelectItem>
                        <SelectItem value="Beli">Dibeli</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 md:w-80">
                    <label className="text-sm font-medium">Search</label>
                    <Input type="text" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Cari berdasarkan barcode atau nomor tabung..." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedCustomerId && <DataTable columns={columns as any} data={data} pageCount={pageCount} pagination={pagination} isLoading={isLoadingCylinders} onPaginationChange={setPagination} />}

        {!selectedCustomerId && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Pilih Pelanggan</h3>
            <p>Data kartu pinjaman akan muncul di sini setelah Anda memilih pelanggan.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
