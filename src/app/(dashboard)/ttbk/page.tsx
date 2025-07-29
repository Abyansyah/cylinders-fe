import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import TTBKList from './components/ttbk-list';

export const metadata: Metadata = {
  title: 'TTBK Saya',
  description: 'Lihat dan kelola semua Tanda Terima Barang Kosong (TTBK) yang ditugaskan kepada Anda.',
};

export default function TTBKPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.returnreceipt.view_driver}>
      <PageTransition>
        <TTBKList />
      </PageTransition>
    </PermissionGuard>
  );
}
