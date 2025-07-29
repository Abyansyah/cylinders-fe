'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';
import type { Warehouse } from '@/types/warehouse';

export const getColumns = (onDelete: (item: Warehouse) => void): ColumnDef<Warehouse>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Gudang" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Alamat" />,
    cell: ({ row }) => <div className="max-w-xs truncate">{row.original.address}</div>,
  },
  {
    accessorKey: 'phone_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. Telepon" />,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { checkPermission } = usePermission();
      const canUpdate = checkPermission(PERMISSIONS.warehouse.update);
      const canDelete = checkPermission(PERMISSIONS.warehouse.delete);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/warehouses/${row.original.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Ubah
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
