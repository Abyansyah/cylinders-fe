import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageTransition } from '@/components/page-transition';
import { BranchForm } from '../components/branch-form';
import { PERMISSIONS } from '@/config/permissions';

export const metadata = {
  title: 'Tambah Cabang Baru',
};

export default function CreateBranchPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.create}>
      <PageTransition>
        <BranchForm />
      </PageTransition>
    </PermissionGuard>
  );
}
