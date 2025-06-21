import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { CustomerForm } from '../components/customer-form';

export const metadata: Metadata = { title: 'Tambah Pelanggan Baru' };

export default function CreateCustomerPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.create}>
      <PageTransition>
        <CustomerForm />
      </PageTransition>
    </PermissionGuard>
  );
}
