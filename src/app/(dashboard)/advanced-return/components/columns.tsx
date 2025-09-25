import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { PICKUP_TYPES } from '@/constants/advanced-return';
import { EDITABLE_STATUSES, STATUS_COLORS } from '@/constants/cylinder';
import { AdvancedReturn } from '@/types/advanced-return';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, Edit, Eye, Package, User } from 'lucide-react';
import Link from 'next/link';

export const getColumns = (): ColumnDef<AdvancedReturn>[] => [
  {
    accessorKey: 'return_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor Return" />,
    cell: ({ row }) => {
      const returnData = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{returnData.return_number}</div>
          <div className="text-sm text-muted-foreground">{new Date(returnData.return_date).toLocaleDateString('id-ID')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pelanggan" />,
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="space-y-1">
          <div className="font-medium">{customer.customer_name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            ID: {customer.id}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'warehouse',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gudang" />,
    cell: ({ row }) => {
      const warehouse = row.original.warehouse;
      return (
        <div className="space-y-1">
          <div className="font-medium">{warehouse.name}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            ID: {warehouse.id}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'pickup_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipe Pickup" />,
    cell: ({ row }) => {
      const pickupType = row.getValue('pickup_type') as string;
      const typeLabel = PICKUP_TYPES.find((type) => type.value === pickupType)?.label;

      return <Badge variant={pickupType === 'COMPLAIN_CLAIM' ? 'destructive' : 'secondary'}>{typeLabel}</Badge>;
    },
  },
  {
    accessorKey: 'total_items',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Item" />,
    cell: ({ row }) => {
      const totalItems = row.getValue('total_items') as string;
      return (
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{totalItems}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Catatan" />,
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string;
      return (
        <div className="max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const returnData = row.original;
      return (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/advanced-return/${returnData.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];
