import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CustomerAuditList from './components/customer-audit-list';

export const metadata: Metadata = {
  title: 'Customer Audit',
  description: 'Kelola dan monitor audit customer untuk inventory tabung gas',
};

export default function CustomerAuditPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.audit.view_all}>
      <PageTransition>
        <CustomerAuditList />
      </PageTransition>
    </PermissionGuard>
  );
}
