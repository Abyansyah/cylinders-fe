import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CylinderPropertyTable from './components/cylinder-property-table';

export const metadata: Metadata = {
  title: 'Cylinder Properties',
};

export default function CylinderPropertiesPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.cylinderProperty.view}>
      <PageTransition>
        <CylinderPropertyTable />
      </PageTransition>
    </PermissionGuard>
  );
}
