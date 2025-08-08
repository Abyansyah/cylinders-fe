import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import CreateTTBKForm from '../components/create-ttbk-form';

export const metadata: Metadata = {
  title: 'Buat TTBK Baru',
  description: 'Buat Tanda Terima Barang Kosong (TTBK) baru.',
};

export default function CreateTTBKPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.returnreceipt.create}>
      <PageTransition>
        <CreateTTBKForm />
      </PageTransition>
    </PermissionGuard>
  );
}
