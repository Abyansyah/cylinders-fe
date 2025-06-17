'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';
import type { CylinderProperty } from '@/types/cylinder-property';
import { Badge } from '@/components/ui/badge';

export const getColumns = (onDelete: (item: CylinderProperty) => void): ColumnDef<CylinderProperty>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'material',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Material" />,
    cell: ({ row }) => row.original.material || '-',
  },
  {
    accessorKey: 'size_cubic_meter',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
    cell: ({ row }) => <Badge variant="secondary">{row.original.size_cubic_meter} m³</Badge>,
  },
  {
    accessorKey: 'max_age_years',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Max Age" />,
    cell: ({ row }) => <span>{row.original.max_age_years} years</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { checkPermission } = usePermission();
      const canUpdate = checkPermission(PERMISSIONS.cylinderProperty.manage);
      const canDelete = checkPermission(PERMISSIONS.cylinderProperty.manage);

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/cylinder-properties/${row.original.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem className="text-red-500" onClick={() => onDelete(row.original)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
