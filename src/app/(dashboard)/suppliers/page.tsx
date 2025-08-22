import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import SupplierTable from './components/supplier-table';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Manajemen Supplier',
  description: 'Kelola semua data supplier.',
};

export default function SuppliersPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.supplier.view}>
      <PageTransition>
        <SupplierTable />
      </PageTransition>
    </PermissionGuard>
  );
}
