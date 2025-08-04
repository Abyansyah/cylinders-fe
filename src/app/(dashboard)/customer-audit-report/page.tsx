import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CustomerAuditReportList from './components/customer-audit-report-list';

export const metadata: Metadata = {
  title: 'Laporan Customer Audit',
  description: 'Lihat dan kelola semua laporan audit customer.',
};

export default function CustomerAuditReportPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.audit.view_all}>
      <PageTransition>
        <CustomerAuditReportList />
      </PageTransition>
    </PermissionGuard>
  );
}
