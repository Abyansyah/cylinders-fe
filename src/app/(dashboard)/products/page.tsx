import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import ProductTable from './components/product-table';

export const metadata: Metadata = {
  title: 'Manajemen Produk',
};

export default function ProductsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.products.view}>
      <PageTransition>
        <ProductTable />
      </PageTransition>
    </PermissionGuard>
  );
}
