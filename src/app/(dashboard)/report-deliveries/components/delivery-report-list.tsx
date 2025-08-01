'use client';

import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Calendar, Filter, RotateCcw, Eye, Download, FileText, FileSpreadsheet } from 'lucide-react';
import type { DeliveryReportItem } from '@/types/delivery-report';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useDebounce } from '@/hooks/use-debounce';
import useSWR from 'swr';
import { getDeliveryReports } from '@/services/reportService';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const STATUS_OPTIONS = [
  { value: 'Menunggu Pickup', label: 'Menunggu Pickup' },
  { value: 'Selesai', label: 'Selesai' },
];

export default function DeliveryReportList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined,
    to: searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined,
  });

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const debouncedStatusFilter = useDebounce(statusFilter, 500);
  const debouncedDateRange = useDebounce(dateRange, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));

    if (debouncedStatusFilter !== 'all') params.set('status', debouncedStatusFilter);
    if (debouncedDateRange?.from) params.set('start_date', format(debouncedDateRange.from, 'yyyy-MM-dd'));
    if (debouncedDateRange?.to) params.set('end_date', format(debouncedDateRange.to, 'yyyy-MM-dd'));

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedStatusFilter, debouncedDateRange, router, pathname, limit]);

  const { data: reportResponse, isLoading } = useSWR(['/reports/deliveries', searchParams.toString()], () => getDeliveryReports(searchParams));

  const reportData = reportResponse?.data || [];
  const totalPages = reportResponse?.totalPages || 0;

  const resetFilters = () => {
    setStatusFilter('all');
    setDateRange(undefined);
  };

  const buildExportUrl = (formatType: 'pdf' | 'excel') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('format', formatType);
    params.delete('page');
    params.delete('limit');
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/deliveries/export?${params.toString()}`;
  };

  const columns: ColumnDef<DeliveryReportItem>[] = [
    {
      accessorKey: 'surat_jalan_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="No. Surat Jalan" />,
      cell: ({ row }) => <div className="font-medium">{row.original.surat_jalan_number}</div>,
    },
    {
      accessorKey: 'order_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="No. Order" />,
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    },
    {
      accessorKey: 'driver_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Driver" />,
    },
    {
      accessorKey: 'dispatch_time',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu Dispatch" />,
      cell: ({ row }) => <span>{format(new Date(row.original.dispatch_time), 'dd MMM yyyy, HH:mm', { locale: id })}</span>,
    },
    {
      accessorKey: 'completion_time',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Waktu Selesai" />,
      cell: ({ row }) => <span>{format(new Date(row.original.completion_time), 'dd MMM yyyy, HH:mm', { locale: id })}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
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
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Laporan Pengiriman</h1>
          <p className="text-sm text-muted-foreground">Lihat dan kelola semua laporan pengiriman</p>
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
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter laporan berdasarkan kriteria tertentu</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-64 justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pilih rentang tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </PopoverContent>
              </Popover>
            </div>
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <DataTable columns={columns} data={reportData} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />
      </motion.div>
    </motion.div>
  );
}
