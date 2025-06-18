import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { GasTypeForm } from '../components/gas-type-form';

export const metadata: Metadata = { title: 'Add New Gas Type' };

export default function CreateGasTypePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.gasType.view}>
      <PageTransition>
        <GasTypeForm />
      </PageTransition>
    </PermissionGuard>
  );
}
