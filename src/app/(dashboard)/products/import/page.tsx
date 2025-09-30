import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import ProductImport from '../components/product-import';

export const metadata: Metadata = {
  title: 'Import Customer',
  description: 'Import data customer dari file Excel',
};

export default function CustomerImportPage() {
  return (
    <PageTransition>
      <ProductImport />
    </PageTransition>
  );
}
