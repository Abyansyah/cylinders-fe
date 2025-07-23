import { Metadata } from 'next';
import { Suspense } from 'react';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import WarehousePrepareTable from './components/warehouse-prepare-table';
import Loading from './loading';

export const metadata: Metadata = {
  title: 'Siapkan Tabung untuk Order',
  description: 'Kelola persiapan tabung gas untuk order yang sudah dikonfirmasi sales.',
};

export default function WarehousePreparePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.warehousePrepare.view}>
      <PageTransition>
        <Suspense fallback={<Loading />}>
          <WarehousePrepareTable />
        </Suspense>
      </PageTransition>
    </PermissionGuard>
  );
}
