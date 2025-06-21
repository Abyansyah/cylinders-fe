'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';

import type { Customer } from '@/types/customer';

export const getColumns = (onDelete: (item: Customer) => void): ColumnDef<Customer>[] => [
  {
    accessorKey: 'customer_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Pelanggan" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.customer_name}</span>
        <span className="text-xs text-muted-foreground">{row.original.company_name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'phone_number',
    header: 'Kontak',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.phone_number}</span>
        <span className="text-xs text-muted-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: 'customer_type',
    header: 'Tipe',
    cell: ({ row }) => <Badge className={row.original.customer_type === 'Individual' ? 'bg-purple-500' : 'bg-blue-500'}>{row.original.customer_type === 'Individual' ? 'Individu' : 'Perusahaan'}</Badge>,
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.userAccount.is_active as boolean;
      const status = isActive ? 'aktif' : 'inactive';
      return <Badge className={isActive ? 'bg-green-500' : 'bg-red-500'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) as string);
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { checkPermission } = usePermission();
      const canUpdate = checkPermission(PERMISSIONS.customer.update);
      const canDelete = checkPermission(PERMISSIONS.customer.delete);
      const canView = checkPermission(PERMISSIONS.customer.view_all);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canView && (
                <DropdownMenuItem asChild>
                  <Link href={`/customers/${row.original.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/customers/${row.original.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Ubah
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(row.original)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
