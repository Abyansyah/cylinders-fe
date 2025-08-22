'use client';

import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { TrendingUp, Plus, Minus, Calendar, User, Filter, RotateCcw, Eye, UserPlus, UserMinus, ArrowRightLeft, Search } from 'lucide-react';
import type { LoanAdjustment, LoanAdjustmentFilters } from '@/types/loan-adjustment';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/stat-card';
import { DatePicker } from '@/components/ui/date-picker';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useDebounce } from '@/hooks/use-debounce';
import useSWR from 'swr';
import { getLoanAdjustments } from '@/services/loanAdjustmentService';
import { format } from 'date-fns';
import { CustomerSearchCombobox } from './customer-search-combobox';

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

const ADJUSTMENT_TYPES = [
  { value: 'ADDITION', label: 'Addition', color: 'bg-green-100 text-green-800' },
  { value: 'REMOVAL', label: 'Removal', color: 'bg-red-100 text-red-800' },
];

export default function LoanAdjustmentsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<LoanAdjustmentFilters>({
    customer_id: searchParams.get('customer_id') || 'all',
    adjustment_type: searchParams.get('adjustment_type') || 'all',
    search: searchParams.get('search') || '',
  });
  const [startDate, setStartDate] = useState<Date | undefined>(searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const debouncedFilters = useDebounce(filters, 500);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));

    if (debouncedFilters.customer_id !== 'all') params.set('customer_id', debouncedFilters.customer_id);
    if (debouncedFilters.adjustment_type !== 'all') params.set('adjustment_type', debouncedFilters.adjustment_type);
    if (debouncedFilters.search) params.set('search', debouncedFilters.search);
    if (debouncedStartDate) params.set('start_date', format(debouncedStartDate, 'yyyy-MM-dd'));
    if (debouncedEndDate) params.set('end_date', format(debouncedEndDate, 'yyyy-MM-dd'));

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedFilters, debouncedStartDate, debouncedEndDate, router, pathname, limit]);

  const { data: loanAdjustmentsResponse, isLoading } = useSWR(['/loans/adjustments', searchParams.toString()], () => getLoanAdjustments(searchParams));
  const filteredData = loanAdjustmentsResponse?.data || [];
  const totalPages = loanAdjustmentsResponse?.totalPages || 0;
  const stats = useMemo(() => {
    const total = loanAdjustmentsResponse?.totalItems || 0;
    const additions = filteredData.filter((item) => item.adjustment_type === 'ADDITION').length;
    const removals = filteredData.filter((item) => item.adjustment_type === 'REMOVAL').length;
    return { total, additions, removals };
  }, [filteredData, loanAdjustmentsResponse]);

  const resetFilters = () => {
    setFilters({
      customer_id: 'all',
      adjustment_type: 'all',
      search: '',
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const columns: ColumnDef<LoanAdjustment>[] = [
    {
      accessorKey: 'adjustment_number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Adjustment Number" />,
      cell: ({ row }) => <div className="font-medium text-blue-600">{row.getValue('adjustment_number')}</div>,
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('customer_name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'adjustment_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(row.getValue('adjustment_date')).toLocaleDateString('id-ID')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'adjustment_type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => {
        const type = row.getValue('adjustment_type') as string;
        const typeConfig = ADJUSTMENT_TYPES.find((t) => t.value === type);
        return (
          <Badge variant="secondary" className={`${typeConfig?.color} flex items-center gap-1 w-fit`}>
            {type === 'ADDITION' ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {typeConfig?.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'total_items',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
      cell: ({ row }) => <div className="text-center font-medium">{row.getValue('total_items')}</div>,
    },
    {
      accessorKey: 'created_by_user',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created By" />,
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue('created_by_user')}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link href={`/loan-adjustments/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
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
    <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Update Pinjaman Relasi</h1>
          </div>
          <p className="text-muted-foreground">Kelola penyesuaian pinjaman tabung untuk relasi bisnis</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <Link href="/loan-adjustments/add">
            <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Relasi
            </Button>
          </Link>
          <Link href="/loan-adjustments/remove">
            <Button variant="outline" className="w-full md:w-auto text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
              <UserMinus className="h-4 w-4 mr-2" />
              Hapus Relasi
            </Button>
          </Link>
          <Link href="/loan-adjustments/transfer">
            <Button variant="outline" className="w-full md:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transfer Relasi
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Adjustments" value={stats.total} subtitle="Total penyesuaian" icon={TrendingUp} gradient="bg-gradient-to-br from-gray-500 to-gray-600" delay={0.1} />
        <StatCard title="Additions" value={stats.additions} subtitle="Penambahan tabung" icon={Plus} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.2} />
        <StatCard title="Removals" value={stats.removals} subtitle="Pengurangan tabung" icon={Minus} gradient="bg-gradient-to-br from-green-500 to-green-600" delay={0.3} />
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter data penyesuaian berdasarkan kriteria tertentu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-4 flex flex-col">
                <Label htmlFor="customer">Customer</Label>
                <CustomerSearchCombobox value={filters.customer_id} onChange={(value) => setFilters((prev) => ({ ...prev, customer_id: value }))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipe Penyesuaian</Label>
                <Select value={filters.adjustment_type} onValueChange={(value) => setFilters((prev) => ({ ...prev, adjustment_type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tipe</SelectItem>
                    {ADJUSTMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.value === 'ADDITION' ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DatePicker label="Start Date" date={startDate} setDate={setStartDate} disabled={(date) => (endDate ? date > endDate : false)} placeholder="Pilih tanggal mulai" id="start_date" />

              <DatePicker label="End Date" date={endDate} setDate={setEndDate} disabled={(date) => (startDate ? date <= startDate : false)} placeholder="Pilih tanggal akhir" id="end_date" />

              <div className="flex items-end">
                <Button onClick={resetFilters} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Alih Fungsi Gas</CardTitle>
            </div>
            <CardDescription>
              Menampilkan {filteredData.length} dari {loanAdjustmentsResponse?.totalItems || 0} penyesuaian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={filteredData} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
