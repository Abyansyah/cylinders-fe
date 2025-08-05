import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import GasConversionList from './components/gas-conversion-list';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Alih Fungsi Gas',
  description: 'Kelola permintaan pengalihan jenis gas pada tabung',
};

export default function GasConversionPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.gasConversion.view_all}>
      <PageTransition>
        <GasConversionList />
      </PageTransition>
    </PermissionGuard>
  );
}
