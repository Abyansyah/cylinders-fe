import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import RefillOrderList from './components/refill-order-list';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Refill Order',
  description: 'Kelola pesanan refill tabung gas',
};

export default function RefillOrdersPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.refillOrder.view}>
      <PageTransition>
        <RefillOrderList />
      </PageTransition>
    </PermissionGuard>
  );
}
