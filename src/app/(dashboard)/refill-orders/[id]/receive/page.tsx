import { Metadata } from 'next';
import ReceiveRefillOrderView from '../../components/receive-refill-order-view';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Penerimaan Tabung Refill Order',
};

export default function ReceiveRefillOrderPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.refillOrder.recieve}>
      <ReceiveRefillOrderView />
    </PermissionGuard>
  );
}
