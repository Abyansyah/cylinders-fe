'use client';
import { motion } from 'framer-motion';
import { Package, Clock, User, Calendar, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/page-transition';
import type { Order } from '@/types/order';
import Link from 'next/link';
import useSWRInfinite from 'swr/infinite';
import { getOrdersToPrepare } from '@/services/orderService';
import { useEffect, useRef } from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: { title: string; value: string | number; subtitle: string; icon: any; gradient: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
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
};

const OrderCard = ({ order, delay = 0 }: { order: any; delay?: number }) => {
  const { id, order_number, customer_name, status, company_name, order_type, order_date, order_time, total_cylinders, total_gas_types, items } = order;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">{order_number}</CardTitle>
            <Badge className={status === 'Dikonfirmasi Sales' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{customer_name}</p>
              <p className="text-xs text-muted-foreground truncate">{company_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm">
                {total_cylinders} Tabung ({total_gas_types} Jenis Gas)
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {items.slice(0, 2).map((item: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item.quantity}x {item.name.split(' ')[1] || 'Gas'}
                  </Badge>
                ))}
                {items.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{items.length - 2} lainnya
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{order_date}</p>
              <p className="text-xs text-muted-foreground">{order_time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Tipe: {order_type}</p>
              {order_type === 'Sewa' && <p className="text-xs text-muted-foreground">Rental tabung gas</p>}
            </div>
          </div>

          <Button asChild className="w-full mt-4 group-hover:bg-blue-600 transition-colors">
            <Link href={`/warehouse-prepare/${id}`} className="gap-2">
              Siapkan Tabung
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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

  const totalItems = data?.[0]?.totalItems || 0;

  return (
    <PageTransition>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Menyiapkan Tabung</h1>
          <p className="text-muted-foreground">Kelola persiapan tabung gas untuk order yang sudah dikonfirmasi sales</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title="Order Menunggu" value={totalItems} subtitle="Perlu disiapkan" icon={Package} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.1} />

          <StatCard title="Total Tabung" value="N/A" subtitle="Harus disiapkan" icon={CheckCircle} gradient="bg-gradient-to-br from-green-500 to-green-600" delay={0.2} />

          <StatCard title="Order Mendesak" value="N/A" subtitle="> 24 jam" icon={AlertCircle} gradient="bg-gradient-to-br from-red-500 to-red-600" delay={0.3} />
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
