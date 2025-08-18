import { Metadata } from 'next';
import ReceiveRefillOrderView from '../../components/receive-refill-order-view';

export const metadata: Metadata = {
  title: 'Penerimaan Tabung Refill Order',
};

export default function ReceiveRefillOrderPage() {
  return <ReceiveRefillOrderView />;
}
