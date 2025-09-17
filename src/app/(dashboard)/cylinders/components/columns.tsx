import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EDITABLE_STATUSES, STATUS_COLORS } from '@/constants/cylinder';
import { Cylinder } from '@/types/cylinder';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export const getColumns = (): ColumnDef<Cylinder>[] => [
  {
    accessorKey: 'barcode_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Barcode ID" />,
    cell: ({ row }) => <div className="font-mono font-medium">{row.getValue('barcode_id')}</div>,
  },
  {
    accessorKey: 'serial_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor tabung" />,
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('serial_number')}</div>,
  },
  {
    accessorKey: 'product',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis Tabung" />,
    cell: ({ row }) => {
      const property = row.original.product;
      return (
        <div>
          <div className="font-medium">{property.name}</div>
          <div className="text-sm text-muted-foreground">{property.sku} </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof STATUS_COLORS;
      return <Badge className={STATUS_COLORS[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'currentWarehouse',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gudang" />,
    cell: ({ row }) => <div className="text-sm">{row.original.currentWarehouse?.name}</div>,
  },
  {
    accessorKey: 'manufacture_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Produksi" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('manufacture_date'));
      return <div className="text-sm">{date.toLocaleDateString('id-ID')}</div>;
    },
  },
  {
    accessorKey: 'ownershipCylinders',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kepemilikan" />,
    cell: ({ row }) => {
      const ownership: any = row.original.ownershipCylinders;
      return <div className="text-sm">{ownership ? `${ownership.customer_name} ${ownership?.company_name !== '' ? `(${ownership?.company_name})` : ''}` : '-'}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cylinder = row.original;
      const canEdit = EDITABLE_STATUSES.includes(cylinder.status);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link className="flex items-center" href={`/cylinders/${cylinder.serial_number}`}>
                <Eye className="mr-2 h-4 w-4" />
                <p>Detail</p>
              </Link>
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem>
                <Link className="flex items-center" href={`/cylinders/${cylinder.serial_number}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  <p> Edit Status</p>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
