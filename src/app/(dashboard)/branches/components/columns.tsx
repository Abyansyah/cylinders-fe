'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';

import type { Branch } from '@/types/branch';

export const getColumns = (onDelete: (item: Branch) => void): ColumnDef<Branch>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Gudang" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.branch_code}</span>
      </div>
    ),
  },
  {
    accessorKey: 'Lokasi',
    header: 'Kontak',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.original.city}</span>
        <span className="text-xs text-muted-foreground">{row.original.province}</span>
      </div>
    ),
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const isActive = row.original.is_active as boolean;
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
      const canUpdate = checkPermission(PERMISSIONS.branch.update);
      const canDelete = checkPermission(PERMISSIONS.branch.delete);

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
                  <Link href={`/branches/${row.original.id}/edit`}>
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
