import { Metadata } from 'next';
import SupplierDetailView from '../components/supplier-detail-view';

export const metadata: Metadata = {
  title: 'Detail Supplier',
};

export default function SupplierDetailPage() {
  return <SupplierDetailView />;
}
