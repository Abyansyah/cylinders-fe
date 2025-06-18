import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import WarehouseTable from './components/warehouse-table';

export const metadata: Metadata = {
  title: 'Manajemen Gudang',
};

export default function WarehousesPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.warehouse.view}>
      <PageTransition>
        <WarehouseTable />
      </PageTransition>
    </PermissionGuard>
  );
}
