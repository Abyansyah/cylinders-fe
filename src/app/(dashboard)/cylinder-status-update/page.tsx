import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import CylinderStatusUpdateForm from './components/cylinder-status-update-form';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Update Status Tabung',
  description: 'Update status tabung secara massal',
};

export default function CylinderStatusUpdatePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.cylinder.bulk_update_status}>
      <PageTransition>
        <CylinderStatusUpdateForm />
      </PageTransition>
    </PermissionGuard>
  );
}
