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
import { getColumns } from '../columns';
import { getUsers } from '@/services/userService';
import { useDebounce } from '@/hooks/use-debounce';
import type { ApiUser } from '@/types/user';
import { deleteUserAction } from '../actions/userActions';

const roleOptions = [
  { label: 'Admin', value: '2' },
  { label: 'Sales', value: '3' },
  { label: 'Petugas Gudang', value: '4' },
  { label: 'Driver', value: '5' },
  { label: 'Customer', value: '6' },
];

const statusOptions = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export default function UserTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const searchTerm = searchParams.get('search') || '';
  const roleId = searchParams.get('role_id') || '';
  const isActive = searchParams.get('is_active') || '';

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
    if (roleId) params.role_id = Number(roleId);
    if (isActive) params.is_active = isActive === 'true';
    return params;
  }, [page, limit, searchTerm, roleId, isActive]);

  const swrKey = useMemo(() => ['/users', JSON.stringify(queryParams)], [queryParams]);

  const {
    data: apiResponse,
    error,
    isLoading,
  } = useSWR(swrKey, () => getUsers(queryParams), {
    keepPreviousData: true,
  });

  const handleDeleteClick = (user: ApiUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    const result = await deleteUserAction(userToDelete.id);

    if (result.success) {
      toast.success(result.message);
      mutate(swrKey);
    } else {
      toast.error(result.message);
    }
    setUserToDelete(null);
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

  const columns = useMemo(() => getColumns(handleDeleteClick), [handleDeleteClick]);

  const dataToShow = apiResponse?.data ?? [];
  const totalPages = apiResponse?.totalPages ?? 0;

  const filterableColumns = [
    { id: 'is_active', title: 'Status', options: statusOptions },
    { id: 'role_id', title: 'Role', options: roleOptions },
  ];

  if (error) return <div>Failed to load users.</div>;

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">User Management</h1>
          <Button onClick={() => router.push('/users/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
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
          filterableColumns={filterableColumns}
          onFilterChange={handleFilterChange}
        />
        {userToDelete && (
          <DeleteAlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Delete User"
            description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </PageTransition>
  );
}
