import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import DriverDeliveriesList from './components/delivery-list';

export const metadata: Metadata = {
  title: 'Pengiriman Saya',
  description: 'Kelola semua pengiriman yang ditugaskan kepada Anda.',
};

export default function DriverDeliveriesPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.driverDelivery.view}>
      <PageTransition>
        <DriverDeliveriesList />
      </PageTransition>
    </PermissionGuard>
  );
}
