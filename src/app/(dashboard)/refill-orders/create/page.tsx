import { Metadata } from 'next';
import CreateRefillOrderForm from '@/app/(dashboard)/refill-orders/components/create-refill-order-form';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Buat Order Refill',
};

export default function CreateRefillOrderPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.refillOrder.create}>
      <CreateRefillOrderForm />
    </PermissionGuard>
  );
}
