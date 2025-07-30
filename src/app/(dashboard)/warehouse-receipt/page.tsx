import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import WarehouseReceiptList from './components/warehouse-receipt-list';

export const metadata: Metadata = {
  title: 'Penerimaan Gudang',
  description: 'Kelola penerimaan tabung yang kembali ke gudang dari customer.',
};

export default function WarehouseReceiptPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.penerimaanTTBK.view}>
      <PageTransition>
        <WarehouseReceiptList />
      </PageTransition>
    </PermissionGuard>
  );
}
