import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { ProductForm } from '../components/product-form';

export const metadata: Metadata = { title: 'Buat Produk Baru' };

export default async function CreateProductPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.products.view}>
      <PageTransition>
        <ProductForm />
      </PageTransition>
    </PermissionGuard>
  );
}
