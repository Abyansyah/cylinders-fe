import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { CylinderPropertyForm } from '../components/cylinder-property-form';

export const metadata: Metadata = { title: 'Add New Cylinder Property' };

export default function CreateCylinderPropertyPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.cylinderProperty.view}>
      <PageTransition>
        <CylinderPropertyForm />
      </PageTransition>
    </PermissionGuard>
  );
}
