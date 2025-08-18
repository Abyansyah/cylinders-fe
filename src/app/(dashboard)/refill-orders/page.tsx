import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import RefillOrderList from './components/refill-order-list';

export const metadata: Metadata = {
  title: 'Refill Order',
  description: 'Kelola pesanan refill tabung gas',
};

export default function RefillOrdersPage() {
  return (
    <PageTransition>
      <RefillOrderList />
    </PageTransition>
  );
}
