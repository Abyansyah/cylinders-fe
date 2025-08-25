import { Metadata } from 'next';
import BulkReceiveSupplierView from './components/bulk-receive-supplier-view';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Penerimaan Masal Supplier',
};

export default function BulkReceiveSupplierPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.refillOrderBulk.view}>
      <BulkReceiveSupplierView />
    </PermissionGuard>
  );
}
