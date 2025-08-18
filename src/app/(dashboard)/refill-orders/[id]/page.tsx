import { Metadata } from 'next';
import RefillOrderDetailView from '../components/refill-order-detail-view';

export const metadata: Metadata = {
  title: 'Detail Order Refill',
};

export default function RefillOrderDetailPage() {
  return <RefillOrderDetailView />;
}
