import { PageTransition } from '@/components/page-transition';
import OrderTable from './components/order-table';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Manajemen Order',
  description: 'Kelola semua pesanan customer',
};

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-12 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-48" />
        <Skeleton className="h-11 w-48" />
        <Skeleton className="h-11 w-48" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <PageTransition>
      <Suspense fallback={<OrdersLoadingSkeleton />}>
        <OrderTable />
      </Suspense>
    </PageTransition>
  );
}
