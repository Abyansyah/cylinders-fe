import { Metadata } from 'next';
import CustomerDetailView from '@/app/(dashboard)/customers/components/customer-detail-view';

export const metadata: Metadata = {
  title: 'Detail Pelanggan',
};

export default function CustomerDetailPage() {
  return <CustomerDetailView />;
}
