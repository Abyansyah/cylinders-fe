import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CustomerTable from './components/customer-table';

export const metadata: Metadata = { title: 'Manajemen Pelanggan' };

export default function CustomersPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.view}>
      <PageTransition>
        <CustomerTable />
      </PageTransition>
    </PermissionGuard>
  );
}
