import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageTransition } from '@/components/page-transition';
import React from 'react';
import BranchTable from './components/branch-table';
import { PERMISSIONS } from '@/config/permissions';

export const metadata = {
  title: 'Manajemen Cabang',
  description: 'Manage all branches in the system.',
  openGraph: {
    title: 'Manajemen Cabang',
    description: 'Manage all branches in the system.',
  },
};

const BranchPage = () => {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.view}>
      <PageTransition>
        <BranchTable />
      </PageTransition>
    </PermissionGuard>
  );
};

export default BranchPage;
