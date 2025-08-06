'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';
import type { GasType } from '@/types/gas-type';

export const getColumns = (onDelete: (item: GasType) => void): ColumnDef<GasType>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Deksripsi" />,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Terakhir diubah" />,
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString('id-ID'),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { checkPermission } = usePermission();
      const canUpdate = checkPermission(PERMISSIONS.gasType.view);
      const canDelete = checkPermission(PERMISSIONS.gasType.view);

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
                  <Link href={`/gas-type/${row.original.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
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
