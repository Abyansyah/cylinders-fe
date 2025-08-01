'use client';

import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Filter, RotateCcw, Download, FileText, FileSpreadsheet } from 'lucide-react';
import type { WarehouseStockReportItem } from '@/types/warehouse-stock-report';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useDebounce } from '@/hooks/use-debounce';
import useSWR from 'swr';
import { getWarehouseStockReports } from '@/services/reportService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WarehouseSearchCombobox } from '../../loan-adjustments/components/warehouse-search-combobox';
import Link from 'next/link';
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

export default function WarehouseStockReportList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [warehouseFilter, setWarehouseFilter] = useState(searchParams.get('warehouse_id') || 'all');
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const debouncedWarehouseFilter = useDebounce(warehouseFilter, 500);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));

    if (debouncedWarehouseFilter !== 'all') params.set('warehouse_id', debouncedWarehouseFilter);

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedWarehouseFilter, router, pathname, limit]);

  const { data: reportResponse, isLoading } = useSWR(['/reports/warehouse-stock', searchParams.toString()], () => getWarehouseStockReports(searchParams));

  const reportData = reportResponse?.data || [];
  const totalPages = reportResponse?.totalPages || 0;

  const resetFilters = () => {
    setWarehouseFilter('all');
  };

  const buildExportUrl = (formatType: 'pdf' | 'excel') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('format', formatType);
    params.delete('page');
    params.delete('limit');
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/warehouse-stock/export?${params.toString()}`;
  };

  const columns: ColumnDef<WarehouseStockReportItem>[] = [
    {
      accessorKey: 'warehouse_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Gudang" />,
    },
    {
      accessorKey: 'product_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Produk" />,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    },
    {
      accessorKey: 'stock_count',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah Stok" />,
      cell: ({ row }) => <div className="text-center font-medium">{row.original.stock_count}</div>,
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
          <h1 className="text-xl font-bold">Laporan Stok Gudang</h1>
          <p className="text-sm text-muted-foreground">Lihat dan kelola semua laporan stok di gudang</p>
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
          <CardContent className="flex flex-col items-end md:flex-row gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="warehouse">Gudang</Label>
              <WarehouseSearchCombobox value={warehouseFilter} onChange={(value) => setWarehouseFilter(value)} />
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
