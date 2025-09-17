'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { User, Package, List } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCustomerLoanCard } from '@/services/customerService';
import { DataTable } from '@/components/ui/data-table/data-table';
import { columns } from './columns';
import { LoanCardItem } from '@/types/loan-card';
import { CustomerSearchCombobox } from '../../loan-adjustments/components/customer-search-combobox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductSummary {
  id_product: number;
  product_name: string;
  total_count: number;
  status_breakdown: {
    [status: string]: number;
  };
  items: LoanCardItem[];
}

export default function LoanCardView() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [activeTab, setActiveTab] = useState('table');

  const debouncedGlobalFilter = useDebounce(globalFilter, 500);

  const canFetchCylinders = !!selectedCustomerId;

  const params = new URLSearchParams();
  params.append('page', (pagination.pageIndex + 1).toString());
  params.append('limit', pagination.pageSize.toString());
  if (debouncedGlobalFilter) {
    params.append('search', debouncedGlobalFilter);
  }
  if (statusFilter !== 'Semua') {
    params.append('status', statusFilter);
  }

  const { data: cylindersResponse, isLoading: isLoadingCylinders } = useSWR(canFetchCylinders ? [`/customers/${selectedCustomerId}/cylinders`, params.toString()] : null, () => getCustomerLoanCard(Number(selectedCustomerId), params));

  const pageCount = cylindersResponse?.totalPages ?? 0;
  const data: LoanCardItem[] = cylindersResponse?.data ?? [];

  const productSummaries: ProductSummary[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped = data.reduce((acc, item) => {
      const key = item.id_product;

      if (!acc[key]) {
        acc[key] = {
          id_product: item.id_product,
          product_name: item.product_name,
          total_count: 0,
          status_breakdown: {},
          items: [],
        };
      }

      acc[key].total_count += 1;
      acc[key].items.push(item);

      const status = item.status;
      acc[key].status_breakdown[status] = (acc[key].status_breakdown[status] || 0) + 1;

      return acc;
    }, {} as { [key: number]: ProductSummary });

    return Object.values(grouped);
  }, [data]);

  const getStatusDisplayName = (status: string) => {
    if (status.includes('Sewa')) return 'Dipinjam';
    if (status.includes('Beli')) return 'Dibeli';
    return status;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kartu Pinjaman Relasi</h1>
          <p className="text-muted-foreground">Lacak tabung yang sedang dipinjam atau dibeli oleh pelanggan.</p>
        </div>

        <Card className="my-4">
          <CardHeader>
            <CardTitle>Pilih Pelanggan</CardTitle>
            <CardDescription>Pilih pelanggan untuk melihat daftar tabung yang mereka pinjam atau beli.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerSearchCombobox value={selectedCustomerId?.toString() || ''} onChange={setSelectedCustomerId} />
          </CardContent>
        </Card>

        {selectedCustomerId && (
          <Card className="my-4">
            <CardHeader>
              <CardTitle>Filter Kartu Pinjaman</CardTitle>
              <CardDescription>Filter kartu pinjaman berdasarkan status dan kata kunci pencarian.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-col gap-2 md:w-80">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Semua">Semua</SelectItem>
                        <SelectItem value="Sewa">Dipinjam</SelectItem>
                        <SelectItem value="Beli">Dibeli</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 md:w-80">
                    <label className="text-sm font-medium">Search</label>
                    <Input type="text" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Cari berdasarkan barcode atau nomor tabung..." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedCustomerId && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Detail Tabung
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ringkasan Produk
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-4">
              <DataTable columns={columns as any} data={data} pageCount={pageCount} pagination={pagination} isLoading={isLoadingCylinders} onPaginationChange={setPagination} />
            </TabsContent>

            <TabsContent value="summary" className="mt-4">
              {isLoadingCylinders ? (
                <div className="flex items-center justify-center py-6">
                  <div className="text-muted-foreground text-sm">Loading...</div>
                </div>
              ) : productSummaries.length > 0 ? (
                <div className="space-y-3">
                  {productSummaries.map((summary) => (
                    <div key={summary.id_product} className="bg-card border rounded-lg p-3 border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm leading-tight truncate">{summary.product_name}</h3>
                        </div>
                        <div className="ml-2 text-right">
                          <div className="text-lg font-bold text-primary">{summary.total_count}</div>
                          <div className="text-xs text-muted-foreground">Unit</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(summary.status_breakdown).map(([status, count]) => (
                          <span key={status} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary/60">
                            {getStatusDisplayName(status)}: <span className="ml-1 font-semibold">{count}</span>
                          </span>
                        ))}
                      </div>

                      <details className="group">
                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer list-none flex items-center gap-1">
                          <span className="transform transition-transform group-open:rotate-90">▶</span>
                          Serial Numbers ({summary.items.length})
                        </summary>
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          <div className="flex flex-wrap gap-1">
                            {summary.items.map((item) => (
                              <span key={item.id} className="bg-background px-2 py-0.5 rounded border text-xs">
                                {item.serial_number}
                              </span>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada data produk untuk ditampilkan.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!selectedCustomerId && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">Pilih Pelanggan</h3>
            <p>Data kartu pinjaman akan muncul di sini setelah Anda memilih pelanggan.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
