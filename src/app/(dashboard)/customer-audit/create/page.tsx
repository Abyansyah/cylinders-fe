import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CreateAuditForm from '../components/create-audit-form';

export const metadata: Metadata = {
  title: 'Buat Audit Baru',
  description: 'Buat audit customer untuk inventory tabung gas',
};

export default function CreateAuditPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.audit.view_all}>
      <PageTransition>
        <CreateAuditForm />
      </PageTransition>
    </PermissionGuard>
  );
}
