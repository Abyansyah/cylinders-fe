import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { WarehouseForm } from '../components/warehouse-form';

export const metadata: Metadata = { title: 'Tambah Gudang Baru' };

export default function CreateWarehousePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.warehouse.create}>
      <PageTransition>
        <WarehouseForm />
      </PageTransition>
    </PermissionGuard>
  );
}
