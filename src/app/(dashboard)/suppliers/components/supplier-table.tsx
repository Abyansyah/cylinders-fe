'use client';

import { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { PaginationState } from '@tanstack/react-table';
import { useDebounce } from '@/hooks/use-debounce';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { DeleteAlertDialog } from '@/components/ui/alert-dialog-custom';
import { getColumns } from './columns';
import type { Supplier } from '@/types/supplier';
import { getSuppliers, deleteSupplier } from '@/services/supplierService';
import Link from 'next/link';

export default function SupplierTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Supplier | null>(null);

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

  const swrKey = useMemo(() => `/suppliers?page=${page}&limit=${limit}&search=${search}`, [page, limit, search]);
  const { data: apiResponse, isLoading } = useSWR(swrKey, () => getSuppliers({ page, limit, search }), { keepPreviousData: true });

  const handleDelete = (item: Supplier) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteSupplier(itemToDelete.id);
      toast.success('Supplier berhasil dihapus.');
      mutate(swrKey);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus supplier.');
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Supplier</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/suppliers/create')}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={apiResponse?.data ?? []}
        isLoading={isLoading}
        pageCount={apiResponse?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        search={{
          placeholder: 'Cari nama supplier...',
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
          description="Aksi ini tidak dapat dibatalkan. Ini akan menghapus data supplier secara permanen."
        />
      )}
    </div>
  );
}
