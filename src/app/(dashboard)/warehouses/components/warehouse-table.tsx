'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { useDebounce } from '@/hooks/use-debounce';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { DeleteAlertDialog } from '@/components/ui/alert-dialog-custom';
import { getColumns } from './columns';
import { getWarehouses } from '@/services/warehouseService';
import { deleteWarehouseAction } from '../actions/warehouseActions';
import type { Warehouse } from '@/types/warehouse';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';

export default function WarehouseTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { checkPermission } = usePermission();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Warehouse | null>(null);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const search = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    if (searchParams.get('search') !== debouncedSearch) router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, router, searchParams]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const swrKey = useMemo(() => `/warehouses?page=${page}&limit=${limit}&search=${search}`, [page, limit, search]);
  const { data: apiResponse, isLoading } = useSWR(swrKey, () => getWarehouses({ page, limit, search }), { keepPreviousData: true });

  const handleDelete = (item: Warehouse) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const result = await deleteWarehouseAction(itemToDelete.id);
    if (result.success) {
      toast.success(result.message);
      mutate(swrKey);
    } else {
      toast.error(result.message);
    }
    setItemToDelete(null);
  };

  const pagination = useMemo<PaginationState>(() => ({ pageIndex: page - 1, pageSize: limit }), [page, limit]);
  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (newPagination.pageIndex + 1).toString());
    params.set('limit', newPagination.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  const columns = useMemo(() => getColumns(handleDelete), []);
  const canCreate = checkPermission(PERMISSIONS.warehouse.create);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Gudang</h1>
        {canCreate && (
          <Button onClick={() => router.push('/warehouses/create')}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Gudang
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={apiResponse?.data ?? []}
        isLoading={isLoading}
        pageCount={apiResponse?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        search={{
          placeholder: 'Cari nama gudang...',
          value: localSearch,
          onChange: setLocalSearch,
        }}
      />
      {itemToDelete && (
        <DeleteAlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title={`Hapus ${itemToDelete.name}`}
          description="Aksi ini tidak dapat dibatalkan. Ini akan menghapus data gudang secara permanen."
        />
      )}
    </div>
  );
}
