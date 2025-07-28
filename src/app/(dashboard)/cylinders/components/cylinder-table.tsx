'use client';

import { useDebounce } from '@/hooks/use-debounce';
import { usePermission } from '@/hooks/use-permission';
import { getCylinders } from '@/services/cylinderService';
import { Cylinder } from '@/types/cylinder';
import { PaginationState } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { getColumns } from './columns';
import { PERMISSIONS } from '@/config/permissions';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CylinderFilter from './cylinder-filter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table/data-table';
import { BarcodeScanner } from '@/components/features/barcode-scanner';

export default function CylinderTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { checkPermission } = usePermission();

  const [showScanner, setShowScanner] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
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
    if (status) params.status = status;
    if (warehouseId) params.warehouseId = warehouseId;
    return params;
  }, [page, limit, search, status, warehouseId]);

  const swrKey = useMemo(() => ['/cylinders', JSON.stringify(queryParams)], [queryParams]);
  const { data: apiResponse, isLoading } = useSWR(swrKey, () => getCylinders(queryParams), { keepPreviousData: true });

  console.log(apiResponse?.data);
  

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize: limit }), [page, limit]);
  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (newPagination.pageIndex + 1).toString());
    params.set('limit', newPagination.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const columns = useMemo(() => getColumns(), []);
  const canCreate = checkPermission(PERMISSIONS.warehouse.create);

  const handleResetFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('status');
    params.delete('warehouse_id');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleScanBarcode = (barcode: string) => {
    setShowScanner(false);
    setLocalSearch(barcode);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Tabung Gas</h1>
          <p className="text-muted-foreground">Kelola data tabung gas dan pantau status pergerakan tabung</p>
        </div>
        <Button onClick={() => router.push('/cylinders/create')} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tabung Gas
        </Button>
      </motion.div>
      <CylinderFilter
        searchTerm={localSearch}
        selectedWarehouse={warehouseId || ''}
        selectedStatus={status}
        handleSearch={setLocalSearch}
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
        setSelectedStatus={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', '1');
          if (value === 'all') {
            params.delete('status');
          } else {
            params.set('status', value);
          }
          router.push(`${pathname}?${params.toString()}`);
        }}
        setShowScanner={setShowScanner}
        onResetFilter={handleResetFilter}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tabung Gas</CardTitle>
            <CardDescription>Total {apiResponse?.totalItems} tabung gas terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable<Cylinder, unknown> columns={columns} data={apiResponse?.data || []} isLoading={isLoading} pagination={pagination} onPaginationChange={handlePaginationChange} pageCount={apiResponse?.totalPages ?? 0} />
          </CardContent>
        </Card>
      </motion.div>
      {showScanner && <BarcodeScanner onClose={() => setShowScanner(false)} onScan={handleScanBarcode} />}
    </div>
  );
}
