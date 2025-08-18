import { Metadata } from 'next';
import CreateRefillOrderForm from '@/app/(dashboard)/refill-orders/components/create-refill-order-form';

export const metadata: Metadata = {
  title: 'Buat Order Refill',
};

export default function CreateRefillOrderPage() {
  return <CreateRefillOrderForm />;
}
