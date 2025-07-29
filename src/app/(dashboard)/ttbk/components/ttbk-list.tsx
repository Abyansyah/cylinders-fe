'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Calendar, Package, User, Eye, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import Link from 'next/link';
import type { TTBKListItem } from '@/types/ttbk';
import { getDriverTTBKs } from '@/services/ttbkService';
import useSWRInfinite from 'swr/infinite';

const TTBK_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'In Transit', label: 'In Transit' },
  { value: 'Completed', label: 'Completed' },
];

export default function TTBKList() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const observerTarget = useRef(null);

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;

    const params = new URLSearchParams();
    params.set('page', (pageIndex + 1).toString());
    params.set('limit', '5');
    if (statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (dateRange?.from) {
      params.set('start_date', format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      params.set('end_date', format(dateRange.to, 'yyyy-MM-dd'));
    }

    return `/return-receipts/driver/my-ttbks?${params.toString()}`;
  };

  const { data, size, setSize, error, isLoading, mutate } = useSWRInfinite(getKey, getDriverTTBKs);

  const ttbkList = data ? [].concat(...data.map((page: any) => page.data)) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < 5);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !isReachingEnd) {
          setSize(size + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, isLoadingMore, isReachingEnd, size, setSize]);

  const resetFilters = () => {
    setStatusFilter('all');
    setDateRange(undefined);
    mutate();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading && !data) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TTBK</h1>
          <p className="text-gray-600">Tanda Terima Barang Kosong</p>
        </div>
        <Link href="/ttbk/create">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Buat TTBK
          </Button>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 w-full sm:w-48">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              mutate();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              {TTBK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-56 justify-between font-normal bg-transparent">
                {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}` : 'Pilih Tanggal'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                captionLayout="dropdown"
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.from && range?.to) mutate();
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto bg-transparent">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </motion.div>

      <div className="grid gap-4">
        {isEmpty ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada TTBK yang ditemukan</p>
          </motion.div>
        ) : (
          ttbkList.map((ttbk: TTBKListItem, index: number) => (
            <motion.div key={ttbk.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{ttbk.ttbk_number}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <User className="w-4 h-4" />
                        <span>{ttbk.customer.customer_name}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ttbk.status)}>{ttbk.status}</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tanggal: {format(new Date(ttbk.receipt_date), 'dd MMMM yyyy', { locale: id })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>Total Item: {ttbk.total_items} tabung</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500">Dibuat: {format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}</span>
                    <Link href={`/ttbk/${ttbk.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
        <div ref={observerTarget} />
      </div>
    </div>
  );
}
