'use client';

import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, FileBarChart, Clock, CheckCircle, FileText } from 'lucide-react';
import type { CustomerAudit, AuditFilters } from '@/types/customer-audit';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useDebounce } from '@/hooks/use-debounce';
import useSWR from 'swr';
import { getAudits, getAuditStats } from '@/services/auditService';
import { getBranches } from '@/services/branchService';
import { getUsers } from '@/services/userService';
import { format } from 'date-fns';
import { CustomerSearchCombobox } from '../../loan-adjustments/components/customer-search-combobox';
import { StatCard } from '@/components/stat-card';

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

const AUDIT_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'Completed', label: 'Completed' },
  { value: 'In Progress', label: 'In Progress' },
];

export default function CustomerAuditList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<AuditFilters>({
    auditor_user_id: searchParams.get('auditor_user_id') || 'all',
    branch_id: searchParams.get('branch_id') || 'all',
    customer_id: searchParams.get('customer_id') || 'all',
    status: searchParams.get('status') || 'all',
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

    if (debouncedFilters.auditor_user_id !== 'all') params.set('auditor_user_id', debouncedFilters.auditor_user_id ?? '');
    if (debouncedFilters.branch_id !== 'all') params.set('branch_id', debouncedFilters.branch_id ?? '');
    if (debouncedFilters.customer_id !== 'all') params.set('customer_id', debouncedFilters.customer_id ?? '');
    if (debouncedFilters.status !== 'all') params.set('status', debouncedFilters.status ?? '');
    if (debouncedStartDate) params.set('start_date', format(debouncedStartDate, 'yyyy-MM-dd'));
    if (debouncedEndDate) params.set('end_date', format(debouncedEndDate, 'yyyy-MM-dd'));

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedFilters, debouncedStartDate, debouncedEndDate, router, pathname, limit]);

  const { data: auditsResponse, isLoading } = useSWR(['/audits', searchParams.toString()], () => getAudits(searchParams));
  const { data: statsResponse } = useSWR('/audits/stats', getAuditStats);
  const { data: usersResponse } = useSWR('/users', () => getUsers({}));
  const { data: branchesResponse } = useSWR('/branches', () => getBranches({}));

  const audits = auditsResponse?.data || [];
  const totalPages = auditsResponse?.totalPages || 0;
  const stats = statsResponse?.data;

  const resetFilters = () => {
    setFilters({
      auditor_user_id: 'all',
      branch_id: 'all',
      customer_id: 'all',
      status: 'all',
    });
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const columns: ColumnDef<CustomerAudit>[] = [
    {
      accessorKey: 'audit_number',
      header: 'Nomor Audit',
      cell: ({ row }: { row: any }) => <div className="font-medium">{row.original.audit_number}</div>,
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="font-medium">{row.original.customer_name}</div>
          <div className="text-sm text-muted-foreground">{row.original.branch_name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'auditor_name',
      header: 'Auditor',
    },
    {
      accessorKey: 'audit_date',
      header: 'Tanggal Audit',
      cell: ({ row }: { row: any }) => <div className="text-sm">{format(new Date(row.original.audit_date), 'dd/MM/yyyy HH:mm')}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => <Badge variant={getStatusBadgeVariant(row.original.status)}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'total_items',
      header: 'Total Items',
      cell: ({ row }: { row: any }) => <div className="text-center font-medium">{row.original.total_items}</div>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const audit = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/customer-audit/${audit.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            {audit.status !== 'Completed' && (
              <Button variant="default" size="sm" onClick={() => router.push(`/customer-audit/${audit.id}/scan`)}>
                Scan
              </Button>
            )}
          </div>
        );
      },
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
    <div className="flex-1 space-y-6 pt-2 md:pt-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Customer Audit</h1>
          <p className="text-muted-foreground">Kelola dan monitor audit customer untuk inventory tabung gas</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Audits" value={stats?.total_audits || 0} subtitle="Total audits dibuat" icon={FileBarChart} gradient="bg-gradient-to-br from-gray-500 to-gray-600" delay={0.1} />
        <StatCard title="Selesai" value={stats?.completed_audits || 0} subtitle="Audits selesai" icon={CheckCircle} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.2} />
        <StatCard title="In Progress" value={stats?.in_progress_audits || 0} subtitle="Audit sedang berjalan" icon={Clock} gradient="bg-gradient-to-br from-green-500 to-green-600" delay={0.3} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Daftar Audit
              </CardTitle>
              <Button onClick={() => router.push('/customer-audit/create')} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Buat Audit
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 pt-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <CustomerSearchCombobox value={filters.customer_id as string} onChange={(value) => setFilters((prev) => ({ ...prev, customer_id: value }))} />
              </div>
              <div className="space-y-2">
                <Label>Cabang</Label>
                <Select value={filters.branch_id} onValueChange={(value) => setFilters((prev) => ({ ...prev, branch_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Cabang</SelectItem>
                    {branchesResponse?.data.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Auditor</Label>
                <Select value={filters.auditor_user_id} onValueChange={(value) => setFilters((prev) => ({ ...prev, auditor_user_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Auditor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Auditor</SelectItem>
                    {usersResponse?.data.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable columns={columns} data={audits} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
