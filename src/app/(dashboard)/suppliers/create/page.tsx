import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { SupplierForm } from '../components/supplier-form';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = { title: 'Tambah Supplier Baru' };

export default function CreateSupplierPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.supplier.manage}>
      <PageTransition>
        <SupplierForm />
      </PageTransition>
    </PermissionGuard>
  );
}
