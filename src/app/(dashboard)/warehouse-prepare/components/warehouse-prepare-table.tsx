'use client';
import { motion } from 'framer-motion';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';
import { PageTransition } from '@/components/page-transition';
import useSWRInfinite from 'swr/infinite';
import { getOrdersToPrepare } from '@/services/orderService';
import { useEffect, useMemo, useRef } from 'react';
import { StatCard } from '@/components/stat-card';
import { OrderCard } from './OrderCard';

export default function WarehousePrepareTable() {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;
    return `orders/warehouse/to-prepare?page=${pageIndex + 1}&limit=10`;
  };

  const { data, size, setSize, error, isLoading } = useSWRInfinite(getKey, getOrdersToPrepare);

  const orders = data ? [].concat(...data.map((page) => page.data)) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < 10);

  const observerTarget = useRef(null);

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

  const stats = useMemo(() => {
    const confirmed = orders.filter((o: any) => o.status === 'Dikonfirmasi Sales').length;
    const prepared = orders.filter((o: any) => o.status === 'Disiapkan Gudang').length;
    const total = orders.length;
    return { confirmed, prepared, total };
  }, [orders]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Menyiapkan Tabung</h1>
          <p className="text-muted-foreground">Kelola persiapan tabung gas untuk order yang sudah dikonfirmasi sales</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title="Total Order" value={stats.total} subtitle="Perlu disiapkan" icon={Package} gradient="bg-gradient-to-br from-gray-500 to-gray-600" delay={0.1} />
          <StatCard title="Dikonfirmasi Sales" value={stats.confirmed} subtitle="Menunggu untuk disiapkan" icon={AlertCircle} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.2} />
          <StatCard title="Disiapkan Gudang" value={stats.prepared} subtitle="Sudah disiapkan" icon={CheckCircle} gradient="bg-gradient-to-br from-green-500 to-green-600" delay={0.3} />
        </div>

        {isEmpty ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tidak Ada Order</h3>
            <p className="text-muted-foreground">Saat ini tidak ada order dengan status "Dikonfirmasi Sales" yang perlu disiapkan.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order: any, index: number) => (
              <OrderCard key={order.id} order={order} delay={0.1 * index} />
            ))}
          </motion.div>
        )}
        <div ref={observerTarget} />
      </div>
    </PageTransition>
  );
}
