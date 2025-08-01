import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import DeliveryReportList from './components/delivery-report-list';

export const metadata: Metadata = {
  title: 'Laporan Pengiriman',
  description: 'Lihat dan kelola semua laporan pengiriman.',
};

export default function DeliveryReportsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.reportDelivery.view}>
      <PageTransition>
        <DeliveryReportList />
      </PageTransition>
    </PermissionGuard>
  );
}
