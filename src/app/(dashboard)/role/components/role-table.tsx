'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { PaginationState } from '@tanstack/react-table';

import { DataTable } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { DeleteAlertDialog } from '@/components/ui/alert-dialog-custom';
import { PageTransition } from '@/components/page-transition';
import { getColumns } from './columns';
import { getRoles } from '@/services/roleService';
import { useDebounce } from '@/hooks/use-debounce';
import type { Role } from '@/types/role';
import { deleteRoleAction } from '../actions/roleActions';

export default function RoleTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const searchTerm = searchParams.get('search') || '';

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }
    if (searchParams.get('search') !== debouncedSearchTerm) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, pathname, router, searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (searchTerm) params.search = searchTerm;
    return params;
  }, [page, limit, searchTerm]);

  const swrKey = useMemo(() => ['/roles', JSON.stringify(queryParams)], [queryParams]);

  const {
    data: apiResponse,
    error,
    isLoading,
  } = useSWR(swrKey, () => getRoles(queryParams), {
    keepPreviousData: true,
  });

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    const result = await deleteRoleAction(roleToDelete.id);

    if (result.success) {
      toast.success(result.message);
      mutate(swrKey);
    } else {
      toast.error(result.message);
    }
    setRoleToDelete(null);
  };

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: page - 1,
      pageSize: limit,
    }),
    [page, limit]
  );

  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (newPagination.pageIndex + 1).toString());
    params.set('limit', newPagination.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const columns = useMemo(() => getColumns(handleDeleteClick), []);

  const dataToShow = apiResponse?.data ?? [];
  const totalPages = apiResponse?.totalPages ?? 0;

  if (error) return <div>Failed to load roles.</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Role Management</h1>
          <Button onClick={() => router.push('/role/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={dataToShow}
          isLoading={isLoading}
          pageCount={totalPages}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          search={{
            placeholder: 'Search by name...',
            value: localSearchTerm,
            onChange: setLocalSearchTerm,
          }}
          onFilterChange={handleFilterChange}
        />
        {roleToDelete && (
          <DeleteAlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete Role"
            description={`Are you sure you want to delete ${roleToDelete?.role_name}? This action cannot be undone.`}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </PageTransition>
  );
}
