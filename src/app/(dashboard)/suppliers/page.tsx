import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import SupplierTable from './components/supplier-table';

export const metadata: Metadata = {
  title: 'Manajemen Supplier',
  description: 'Kelola semua data supplier.',
};

export default function SuppliersPage() {
  return (
    <PageTransition>
      <SupplierTable />
    </PageTransition>
  );
}
