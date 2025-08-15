import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import CylinderImport from '../components/cylinder-import';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Import Tabung',
  description: 'Import data tabung dari file Excel',
};

export default function CylinderImportPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.importDataCustomer.view}>
      <PageTransition>
        <CylinderImport />
      </PageTransition>
    </PermissionGuard>
  );
}
