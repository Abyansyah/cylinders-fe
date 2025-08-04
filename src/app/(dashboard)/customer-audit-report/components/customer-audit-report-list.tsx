'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreHorizontal, Eye, Calendar, User, Truck, Package, RotateCcw, Search, Download, FileText, FileSpreadsheet, Building2, Filter, Users } from 'lucide-react';
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
import type { CustomerAuditReportItem, AuditReportFilters } from '@/types/customer-audit-report';
import { PageTransition } from '@/components/page-transition';
import useSWR from 'swr';
import { getCustomerAuditReports } from '@/services/reportService';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { CustomerSearchCombobox } from '../../loan-adjustments/components/customer-search-combobox';
import { AuditorSearchCombobox } from './auditor-search-combobox';
import { BranchSearchCombobox } from './branch-search-combobox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';

const AUDIT_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Completed', label: 'Completed' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Draft', label: 'Draft' },
];

export default function CustomerAuditReportList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<AuditReportFilters>({
    auditor_id: searchParams.get('auditor_id') || 'all',
    branch_id: searchParams.get('branch_id') || 'all',
    customer_id: searchParams.get('customer_id') || 'all',
    status: searchParams.get('status') || 'all',
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined,
    to: searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined,
  });

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const debouncedFilters = useDebounce(filters, 500);
  const debouncedDateRange = useDebounce(dateRange, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));

    if (debouncedFilters.auditor_id !== 'all') params.set('auditor_id', debouncedFilters.auditor_id);
    if (debouncedFilters.branch_id !== 'all') params.set('branch_id', debouncedFilters.branch_id);
    if (debouncedFilters.customer_id !== 'all') params.set('customer_id', debouncedFilters.customer_id);
    if (debouncedFilters.status !== 'all') params.set('status', debouncedFilters.status);
    if (debouncedDateRange?.from) params.set('start_date', format(debouncedDateRange.from, 'yyyy-MM-dd'));
    if (debouncedDateRange?.to) params.set('end_date', format(debouncedDateRange.to, 'yyyy-MM-dd'));

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedFilters, debouncedDateRange, router, pathname, limit]);

  const { data: reportResponse, isLoading } = useSWR(['/reports/audits', searchParams.toString()], () => getCustomerAuditReports(searchParams));

  const reportData = reportResponse?.data || [];
  const totalPages = reportResponse?.totalPages || 0;

  const resetFilters = () => {
    setFilters({
      auditor_id: 'all',
      branch_id: 'all',
      customer_id: 'all',
      status: 'all',
    });
    setDateRange(undefined);
  };

  const buildExportUrl = (formatType: 'pdf' | 'excel') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('format', formatType);
    params.delete('page');
    params.delete('limit');
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/audits/export?${params.toString()}`;
  };

  const columns: ColumnDef<CustomerAuditReportItem>[] = [
    {
      accessorKey: 'audit_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="No. Audit" />,
      cell: ({ row }) => <div className="font-medium">{row.original.audit_number}</div>,
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    },
    {
      accessorKey: 'auditor_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Auditor" />,
    },
    {
      accessorKey: 'branch_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cabang" />,
    },
    {
      accessorKey: 'audit_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tanggal Audit" />,
      cell: ({ row }) => <span>{format(new Date(row.original.audit_date), 'dd MMM yyyy, HH:mm', { locale: id })}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'summary',
      header: 'Summary',
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span>Expected: {row.original.summary.expected}</span>
          <span>Found: {row.original.summary.found}</span>
          <span>Missing: {row.original.summary.missing}</span>
          <span>Unexpected: {row.original.summary.unexpected}</span>
        </div>
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
            <h1 className="text-xl font-bold">Laporan Customer Audit</h1>
            <p className="text-sm text-muted-foreground">Lihat dan kelola semua laporan audit customer</p>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter laporan berdasarkan kriteria tertentu</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CustomerSearchCombobox value={filters.customer_id} onChange={(value) => setFilters((prev) => ({ ...prev, customer_id: value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <AuditorSearchCombobox value={filters.auditor_id} onChange={(value) => setFilters((prev) => ({ ...prev, auditor_id: value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <BranchSearchCombobox value={filters.branch_id} onChange={(value) => setFilters((prev) => ({ ...prev, branch_id: value }))} />
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
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </CardContent>
        </Card>

        <DataTable columns={columns} data={reportData} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />
      </div>
    </PageTransition>
  );
}
