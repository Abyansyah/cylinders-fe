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
import type { Product } from '@/types/product';

export const getColumns = (onDelete: (item: Product) => void): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Produk" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.sku}</span>
      </div>
    ),
  },
  {
    accessorKey: 'gasType',
    header: 'Tipe Gas',
    cell: ({ row }) => row.original.gasType.name,
  },
  {
    accessorKey: 'cylinderProperty',
    header: 'Properti Tabung',
    cell: ({ row }) => row.original.cylinderProperty.name,
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge variant={row.original.is_active ? 'default' : 'destructive'}>{row.original.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { checkPermission } = usePermission();
      const canUpdate = checkPermission(PERMISSIONS.product.manage);
      const canDelete = checkPermission(PERMISSIONS.product.manage);
      const canView = checkPermission(PERMISSIONS.product.manage);

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
                  <Link href={`/products/${row.original.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/products/${row.original.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Ubah
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={() => onDelete(row.original)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
