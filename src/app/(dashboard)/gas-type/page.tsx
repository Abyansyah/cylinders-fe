import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import GasTypeTable from './components/gas-type-table';

export const metadata: Metadata = {
  title: 'Gas Type Management',
};

export default function GasTypePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.gasType.manage}>
      <PageTransition>
        <GasTypeTable />
      </PageTransition>
    </PermissionGuard>
  );
}
