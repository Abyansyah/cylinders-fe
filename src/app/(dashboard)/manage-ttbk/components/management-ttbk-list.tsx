'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Calendar, User, Truck, Package, RotateCcw, Search, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import type { ManagementTTBKItem, ManagementTTBKFilters } from '@/types/management-ttbk';
import { PageTransition } from '@/components/page-transition';
import useSWR from 'swr';
import { getManagementTTBKs } from '@/services/ttbkService';
import { getDrivers } from '@/services/userService';
import { getWarehouses } from '@/services/warehouseService';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';

export default function ManagementTTBKList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ManagementTTBKFilters>({
    driver_id: searchParams.get('driver_id') || '',
    destination_warehouse_id: searchParams.get('destination_warehouse_id') || '',
    status: searchParams.get('status') || 'all',
    ttbk_number: searchParams.get('ttbk_number') || '',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined,
    to: searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined,
  });

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const [ttbkNumberSearch, setTtbkNumberSearch] = useState(filters.ttbk_number);

  const debouncedFilters = useDebounce(filters, 500);
  const debouncedDateRange = useDebounce(dateRange, 500);
  const debouncedTtbkNumberSearch = useDebounce(ttbkNumberSearch, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));

    if (debouncedFilters.driver_id) params.set('driver_id', debouncedFilters.driver_id);
    if (debouncedFilters.destination_warehouse_id) params.set('destination_warehouse_id', debouncedFilters.destination_warehouse_id);
    if (debouncedFilters.status !== 'all') params.set('status', debouncedFilters.status);
    if (debouncedTtbkNumberSearch) params.set('ttbk_number', debouncedTtbkNumberSearch);
    if (debouncedDateRange?.from) params.set('start_date', format(debouncedDateRange.from, 'yyyy-MM-dd'));
    if (debouncedDateRange?.to) params.set('end_date', format(debouncedDateRange.to, 'yyyy-MM-dd'));

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedFilters, debouncedDateRange, debouncedTtbkNumberSearch, router, pathname, limit]);

  const { data: ttbkResponse, isLoading } = useSWR(['/return-receipts', searchParams.toString()], () => getManagementTTBKs(searchParams));
  const { data: driversResponse } = useSWR('/users/drivers', getDrivers);
  const { data: warehousesResponse } = useSWR('/warehouses', () => getWarehouses({}));

  const ttbkData = ttbkResponse?.data || [];
  const totalPages = ttbkResponse?.totalPages || 0;

  const resetFilters = () => {
    setFilters({ driver_id: '', destination_warehouse_id: '', status: 'all', ttbk_number: '' });
    setTtbkNumberSearch('');
    setDateRange(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Completed':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const buildExportUrl = (formatType: 'pdf' | 'excel') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('format', formatType);
    params.delete('page');
    params.delete('limit');
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/return-receipts/export?${params.toString()}`;
  };

  const columns: ColumnDef<ManagementTTBKItem>[] = [
    {
      accessorKey: 'ttbk_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="No. TTBK" />,
      cell: ({ row }) => <div className="font-medium">{row.original.ttbk_number}</div>,
    },
    {
      accessorKey: 'customer.customer_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.customer.customer_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'driver.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Driver" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.driver.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'receipt_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(row.original.receipt_date), 'dd MMM yyyy', { locale: id })}</span>
        </div>
      ),
    },
    {
      accessorKey: 'total_items',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Item" />,
      cell: ({ row }) => <div>{row.original.total_items} tabung</div>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge className={`${getStatusColor(row.original.status)} text-white`}>{row.original.status}</Badge>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/ttbk/${row.original.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">Management TTBK</h1>
            <p className="text-sm text-muted-foreground">Kelola dan pantau semua Tanda Terima Barang Kosong</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={buildExportUrl('pdf')} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" />
                  Export as PDF
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={buildExportUrl('excel')} target="_blank" rel="noopener noreferrer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export as Excel
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-wrap p-4 bg-muted/50 rounded-lg">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari No. TTBK..." value={ttbkNumberSearch} onChange={(e) => setTtbkNumberSearch(e.target.value)} className="pl-8" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-48">
            <Truck className="w-4 h-4 text-gray-500" />
            <Select value={filters.driver_id || 'all'} onValueChange={(value) => setFilters({ ...filters, driver_id: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Driver</SelectItem>
                {driversResponse?.data.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id.toString()}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-48">
            <Package className="w-4 h-4 text-gray-500" />
            <Select value={filters.destination_warehouse_id || 'all'} onValueChange={(value) => setFilters({ ...filters, destination_warehouse_id: value === 'all' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Gudang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gudang</SelectItem>
                {warehousesResponse?.data.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-56 justify-between font-normal bg-transparent">
                  {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}` : 'Pilih Tanggal'}
                  <Calendar className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <CalendarComponent mode="range" selected={dateRange} onSelect={setDateRange} />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <DataTable columns={columns} data={ttbkData} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />
      </div>
    </PageTransition>
  );
}
