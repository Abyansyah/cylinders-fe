import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CreateAdvancedReturnForm from '../components/advanced-create';

export const metadata: Metadata = { title: 'Tambah Pelanggan Baru' };

export default function CreateAdvancedReturnPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.advancedReturn.create}>
      <PageTransition>
        <CreateAdvancedReturnForm />
      </PageTransition>
    </PermissionGuard>
  );
}
