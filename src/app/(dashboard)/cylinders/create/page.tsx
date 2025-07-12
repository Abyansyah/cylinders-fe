import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageTransition } from '@/components/page-transition';
import { PERMISSIONS } from '@/config/permissions';
import CylinderFormCreate from '../components/cylinder-form-create';

export const metadata = { title: 'Tambah Cylinder Baru' };

export default function CreateCylinderPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.cylinder.create}>
      <PageTransition>
        <CylinderFormCreate />
      </PageTransition>
    </PermissionGuard>
  );
}
