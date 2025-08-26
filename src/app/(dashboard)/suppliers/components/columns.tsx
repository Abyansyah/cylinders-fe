'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Supplier } from '@/types/supplier';

export const getColumns = (onDelete: (item: Supplier) => void): ColumnDef<Supplier>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Supplier" />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Alamat" />,
  },
  {
    accessorKey: 'phone_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. Telepon" />,
  },
  {
    accessorKey: 'contact_person',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kontak Person" />,
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <Badge variant={row.original.is_active ? 'default' : 'destructive'}>{row.original.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/suppliers/${row.original.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Ubah
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/suppliers/${row.original.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => onDelete(row.original)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
