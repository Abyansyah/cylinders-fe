'use client';

import { ColumnDef } from '@tanstack/react-table';
import { LoanCardItem } from '@/types/loan-card';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'product_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Produk" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue('product_name')}</div>,
  },
  {
    accessorKey: 'barcode_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Barcode" />,
    cell: ({ row }) => <div className="font-mono">{row.getValue('barcode_id')}</div>,
  },
  {
    accessorKey: 'serial_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Serial Number" />,
    cell: ({ row }) => <div className="font-mono">{row.getValue('serial_number')}</div>,
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
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isSewa = status.toLowerCase().includes('sewa');
      return <Badge variant={isSewa ? 'default' : 'secondary'}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'tanggal_kirim',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tgl. Kirim" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('tanggal_kirim'));
      return <span>{date.toLocaleDateString('id-ID')}</span>;
    },
  },
  {
    accessorKey: 'jumlah_hari',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah Hari" />,
    cell: ({ row }) => <div className="text-center">{row.getValue('jumlah_hari')}</div>,
  },
];
