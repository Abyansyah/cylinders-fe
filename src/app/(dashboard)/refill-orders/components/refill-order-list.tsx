'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Calendar, User, Building2, ChartLine, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { RefillOrder } from '@/types/refill-order';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';
import useSWR from 'swr';
import { getRefillOrders, getSuppliersForSelect, viewSummarySuppliers } from '@/services/refillOrderService';
import { useDebounce } from '@/hooks/use-debounce';
import { StatCard } from '@/components/stat-card';

const REFILL_ORDER_STATUSES = [
  { value: 'PENDING_CONFIRMATION', label: 'Menunggu Konfirmasi' },
  { value: 'IN_TRANSIT_TO_SUPPLIER', label: 'Sedang Di supplier' },
  { value: 'PARTIALLY_RECEIVED', label: 'Diterima Sebagian' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800';
    case 'IN_TRANSIT_TO_SUPPLIER':
      return 'bg-orange-100 text-orange-800';
    case 'PARTIALLY_RECEIVED':
      return 'bg-purple-100 text-purple-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  return REFILL_ORDER_STATUSES.find((s) => s.value === status)?.label || status;
};

const columns: ColumnDef<RefillOrder>[] = [
  {
    accessorKey: 'refill_order_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor Order" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue('refill_order_number')}</div>,
  },
  {
    accessorKey: 'supplier_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue('supplier_name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'requester_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Pemohon" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span>{row.getValue('requester_name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'request_date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{new Date(row.getValue('request_date')).toLocaleDateString('id-ID')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge className={getStatusBadgeColor(status)}>{getStatusLabel(status)}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/refill-orders/${row.original.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    ),
  },
];

export default function RefillOrderList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { checkPermission } = usePermission();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [supplierFilter, setSupplierFilter] = useState<string>(searchParams.get('supplier_id') || 'all');

  const debouncedSearch = useDebounce(searchTerm, 500);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const canFetchSummarySuppliers = !!supplierFilter && supplierFilter !== 'all';

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (supplierFilter !== 'all') params.set('supplier_id', supplierFilter);
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, statusFilter, supplierFilter, router, pathname, limit]);

  const canViewAll = checkPermission(PERMISSIONS.refillOrder.view_all);
  const apiEndpoint = canViewAll ? '/refill-orders' : '/refill-orders/my-orders';

  const { data: ordersResponse, isLoading } = useSWR([apiEndpoint, searchParams.toString()], () => getRefillOrders(apiEndpoint, searchParams));
  const { data: suppliersResponse } = useSWR('/select-lists/suppliers', getSuppliersForSelect);
  const { data: supplierSummaryResponse } = useSWR(canFetchSummarySuppliers ? [`/refill-orders/summary-by-supplier?supplier_id=${supplierFilter}`] : null, () => viewSummarySuppliers(Number(supplierFilter)));

  const filteredOrders = ordersResponse?.data || [];
  const totalPages = ordersResponse?.totalPages || 0;

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: page - 1,
      pageSize: limit,
    }),
    [page, limit]
  );

  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (newPagination.pageIndex + 1).toString());
    params.set('limit', newPagination.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Refill</h1>
            <p className="text-muted-foreground">Kelola pesanan refill tabung gas</p>
          </div>
          <Button asChild>
            <Link href="/refill-orders/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Order Refill
            </Link>
          </Button>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari order..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {REFILL_ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Supplier</SelectItem>
                  {suppliersResponse?.data.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSupplierFilter('all');
                }}
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="my-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="h-5 w-5" />
              Summary Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <StatCard title="Total Tabung Terkirim" subtitle="" value={supplierSummaryResponse?.summary.total_cylinders_sent || 0} icon={Package} gradient="bg-gradient-to-r from-blue-500 to-blue-600" delay={0} />
              <StatCard title="Total Tabung Kembali" subtitle="" value={supplierSummaryResponse?.summary.cylinders_returned || 0} icon={Package} gradient="bg-gradient-to-r from-green-500 to-green-600" delay={0.1} />
              <StatCard title='Total Tabung Belum Kembali' subtitle='' value={supplierSummaryResponse?.summary?.cylinders_outstanding || 0} icon={Package} gradient='bg-gradient-to-r from-red-500 to-red-600' delay={0.2} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <DataTable columns={columns} data={filteredOrders} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
