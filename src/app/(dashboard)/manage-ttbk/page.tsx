import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import ManagementTTBKList from './components/management-ttbk-list';

export const metadata: Metadata = {
  title: 'Manajemen TTBK',
  description: 'Kelola dan pantau semua Tanda Terima Barang Kosong (TTBK).',
};

export default function ManagementTTBKPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.returnreceipt.view_all}>
      <PageTransition>
        <ManagementTTBKList />
      </PageTransition>
    </PermissionGuard>
  );
}
