'use client';

import { useDebounce } from '@/hooks/use-debounce';
import { PaginationState } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { getColumns } from './columns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getAdvancedReturns } from '@/services/advancedReturnService';
import { AdvancedReturn } from '@/types/advanced-return';
import AdvancedReturnFilter from './advanced-filter';

export default function AdvancedTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const pickupType = searchParams.get('pickup_type') || '';
  const warehouseId = searchParams.get('warehouse_id') || '';

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 200);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const currentUrlSearch = searchParams.get('search') || '';

    if (currentUrlSearch !== debouncedSearch) {
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }

      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (pickupType) params.pickup_type = pickupType;
    if (warehouseId) params.warehouseId = warehouseId;
    return params;
  }, [page, limit, search, pickupType, warehouseId]);

  const swrKey = useMemo(() => ['/advanced-returns', JSON.stringify(queryParams)], [queryParams]);
  const { data: apiResponse, isLoading } = useSWR(swrKey, () => getAdvancedReturns(queryParams), { keepPreviousData: true });

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize: limit }), [page, limit]);
  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (newPagination.pageIndex + 1).toString());
    params.set('limit', newPagination.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const columns = useMemo(() => getColumns(), []);

  const handleResetFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('pickup_type');
    params.delete('warehouse_id');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pickup Tabung</h1>
          <p className="text-muted-foreground">Kelola return tabung dari pelanggan</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/advanced-return/create')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Buat Return
          </Button>
        </div>
      </motion.div>

      <AdvancedReturnFilter
        searchTerm={localSearch}
        selectedWarehouse={warehouseId || ''}
        handleSearch={setLocalSearch}
        pickupTypeFilter={pickupType || ''}
        setSelectedWarehouse={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', '1');
          if (value === 'all') {
            params.delete('warehouse_id');
          } else {
            params.set('warehouse_id', value);
          }
          router.push(`${pathname}?${params.toString()}`);
        }}
        setPickupTypeFilter={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', '1');
          if (value === 'all') {
            params.delete('pickup_type');
          } else {
            params.set('pickup_type', value);
          }
          router.push(`${pathname}?${params.toString()}`);
        }}
        onResetFilter={handleResetFilter}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tabung Gas</CardTitle>
            <CardDescription>Total {apiResponse?.totalItems} tabung gas terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable<AdvancedReturn, unknown> columns={columns} data={apiResponse?.data || []} isLoading={isLoading} pagination={pagination} onPaginationChange={handlePaginationChange} pageCount={apiResponse?.totalPages ?? 0} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
