import { Metadata } from 'next';
import DeliveryNoteView from '@/app/(dashboard)/refill-orders/components/delivery-note-view';

export const metadata: Metadata = {
  title: 'Surat Jalan Refill Order',
};

export default function DeliveryNotePage() {
  return <DeliveryNoteView />;
}
