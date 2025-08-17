import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { SupplierForm } from '../components/supplier-form';

export const metadata: Metadata = { title: 'Tambah Supplier Baru' };

export default function CreateSupplierPage() {
  return (
    <PageTransition>
      <SupplierForm />
    </PageTransition>
  );
}
