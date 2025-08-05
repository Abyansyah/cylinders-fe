import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import CreateGasConversionForm from '../components/create-gas-conversion-form';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Buat Permintaan Alih Fungsi Gas',
  description: 'Buat permintaan baru untuk pengalihan jenis gas pada tabung',
};

export default function CreateGasConversionPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.gasConversion.create}>
      <PageTransition>
        <CreateGasConversionForm />
      </PageTransition>
    </PermissionGuard>
  );
}
