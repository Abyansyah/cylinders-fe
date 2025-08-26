'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, MoreHorizontal, Package, Calendar, User, TrendingUp, XCircle, X, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { ORDER_STATUSES } from '@/constants/order';
import type { Order } from '@/types/order';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';
import { cancelOrder, getOrders, getOrderStats } from '@/services/orderService';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/date-range-picker';
import { toast } from 'sonner';
import { CancelOrderModal } from './cancel-order-modal';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    'Dikonfirmasi Sales': 'bg-blue-100 text-blue-800',
    'Diproses Gudang': 'bg-yellow-100 text-yellow-800',
    'Siap Kirim': 'bg-green-100 text-green-800',
    'Dalam Pengiriman': 'bg-purple-100 text-purple-800',
    Selesai: 'bg-emerald-100 text-emerald-800',
    Dibatalkan: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getOrderTypeColor = (type: string) => {
  return type === 'Sewa' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800';
};
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: { title: string; value: string | number; subtitle: string; icon: any; gradient: string; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, delay, type: 'spring', stiffness: 100 }} whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}>
    <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient} text-white`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.3, type: 'spring', stiffness: 200 }} className="text-3xl font-bold">
              {value}
            </motion.div>
            <p className="text-white/70 text-xs">{subtitle}</p>
          </div>
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: delay + 0.2, duration: 0.5 }}
            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg" />
      </CardContent>
    </Card>
  </motion.div>
);

export default function OrderTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localSearch, setLocalSearch] = useState(searchParams.get('order_number_search') || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get('date_start') ? new Date(searchParams.get('date_start') as string) : undefined,
    to: searchParams.get('date_end') ? new Date(searchParams.get('date_end') as string) : undefined,
  });

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const statusFilter = searchParams.get('status') || 'all';
  const typeFilter = searchParams.get('order_type') || 'all';

  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const buildQueryString = useCallback(
    (params: URLSearchParams) => {
      const newParams = new URLSearchParams();
      if (params.get('page') && params.get('page') !== '1') newParams.set('page', params.get('page')!);
      if (params.get('limit') && params.get('limit') !== '10') newParams.set('limit', params.get('limit')!);
      if (params.get('order_number_search')) newParams.set('order_number_search', params.get('order_number_search')!);
      if (params.get('status') && params.get('status') !== 'all') newParams.set('status', params.get('status')!);
      if (params.get('order_type') && params.get('order_type') !== 'all') newParams.set('order_type', params.get('order_type')!);
      if (params.get('date_start')) newParams.set('date_start', params.get('date_start')!);
      if (params.get('date_end')) newParams.set('date_end', params.get('date_end')!);

      return newParams.toString() ? `?${newParams.toString()}` : pathname;
    },
    [pathname]
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set('order_number_search', debouncedSearch);
    } else {
      params.delete('order_number_search');
    }

    if (dateRange?.from) {
      params.set('date_start', format(dateRange.from, 'yyyy-MM-dd'));
    } else {
      params.delete('date_start');
    }
    if (dateRange?.to) {
      params.set('date_end', format(dateRange.to, 'yyyy-MM-dd'));
    } else {
      params.delete('date_end');
    }

    params.set('page', '1');

    router.push(buildQueryString(params));
  }, [debouncedSearch, dateRange, buildQueryString, router]);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(buildQueryString(params));
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setDateRange(undefined);
    router.push(pathname);
  };

  const { data: stats, isLoading: isLoadingStats } = useSWR('/orders/stats', getOrderStats);

  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (debouncedSearch) params.order_number_search = debouncedSearch;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.order_type = typeFilter;
    if (searchParams.get('date_start')) params.date_start = searchParams.get('date_start');
    if (searchParams.get('date_end')) params.date_end = searchParams.get('date_end');
    return params;
  }, [page, limit, debouncedSearch, statusFilter, typeFilter, searchParams]);

  const { data: ordersResponse, isLoading: isLoadingOrders, mutate: mutateOrders } = useSWR(['/orders', JSON.stringify(queryParams)], () => getOrders(queryParams as any), { keepPreviousData: true });

  const isLoading = isLoadingOrders || isLoadingStats;

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

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (notes: string) => {
    if (!orderToCancel) return;
    setIsCancelling(true);

    try {
      await cancelOrder(orderToCancel.id, notes);
      toast.success('Order berhasil dibatalkan.');
      mutate(['/orders', JSON.stringify(queryParams)]);
      setIsCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: 'order_number',
        header: ({ column }) => <DataTableColumnHeader column={column} title="No. Order" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('order_number')}</div>,
      },
      {
        accessorKey: 'customer',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => {
          const customer = row.original.customer;
          return (
            <div>
              <div className="font-medium">{customer.customer_name}</div>
              <div className="text-sm text-muted-foreground">{customer.company_name}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'order_type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tipe" />,
        cell: ({ row }) => <Badge className={getOrderTypeColor(row.getValue('order_type'))}>{row.getValue('order_type')}</Badge>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <Badge className={getStatusColor(row.getValue('status'))}>{row.getValue('status')}</Badge>,
      },
      {
        accessorKey: 'order_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Order" />,
        cell: ({ row }) => {
          const date = new Date(row.getValue('order_date'));
          return <div className="text-sm">{date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>;
        },
      },
      {
        accessorKey: 'items',
        header: 'Items',
        cell: ({ row }) => `${row.original.items.length} item(s)`,
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const order = row.original;
          const canBeCancelled = order.status !== 'Selesai' && order.status !== 'Dibatalkan Sales';
          const isReadyToShip = order.status === 'Siap Kirim';
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/orders/${order.id}`} className="flex items-center">
                    <Eye className="mr-2 h-4 w-4" />
                    Detail
                  </Link>
                </DropdownMenuItem>
                {isReadyToShip && (
                  <DropdownMenuItem asChild>
                    <Link href={`/orders/${order.id}/driver-prepare`} className="flex items-center">
                      <Truck className="mr-2 h-4 w-4" />
                      Atur Pengiriman
                    </Link>
                  </DropdownMenuItem>
                )}
                {canBeCancelled && (
                  <DropdownMenuItem onClick={() => handleCancelClick(order)} className="text-red-500 flex items-center">
                    <XCircle className="mr-2 h-4 w-4" />
                    Batalkan
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Kelola semua pesanan customer</p>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Button asChild size="lg" className="gap-2">
            <Link href="/orders/create">
              <Plus className="h-4 w-4" />
              Buat Order
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value={stats?.total_order ?? 0} subtitle="Semua order" icon={Package} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.1} />
        <StatCard title="Orders Aktif" value={stats?.order_aktif ?? 0} subtitle="Sedang diproses" icon={Calendar} gradient="bg-gradient-to-br from-green-500 to-green-600" delay={0.2} />
        <StatCard title="Orders Sewa" value={stats?.total_order_sewa ?? 0} subtitle="Rental aktif" icon={User} gradient="bg-gradient-to-br from-orange-500 to-orange-600" delay={0.3} />
        <StatCard title="Orders Beli" value={stats?.total_order_beli ?? 0} subtitle="Penjualan" icon={TrendingUp} gradient="bg-gradient-to-br from-purple-500 to-purple-600" delay={0.4} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Cari order, customer..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="pl-10 h-11" />
        </div>

        <DateRangePicker date={dateRange} onDateChange={setDateRange} />

        <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-full sm:w-[180px] h-11">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(value) => handleFilterChange('order_type', value)}>
          <SelectTrigger className="w-full sm:w-[180px] h-11">
            <SelectValue placeholder="Tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="Sewa">Sewa</SelectItem>
            <SelectItem value="Beli">Beli</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleResetFilters} variant="ghost" className="h-11 gap-2">
          <X className="h-4 w-4" /> Reset
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <DataTable columns={columns} data={ordersResponse?.data ?? []} isLoading={isLoading} pageCount={ordersResponse?.totalPages ?? 0} pagination={pagination} onPaginationChange={handlePaginationChange} />
      </motion.div>

      <CancelOrderModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={handleConfirmCancel} orderNumber={orderToCancel?.order_number || ''} isLoading={isCancelling} />
    </div>
  );
}
