import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageTransition } from '@/components/page-transition';
import { PERMISSIONS } from '@/config/permissions';
import React from 'react';
import CylinderTable from './components/cylinder-table';

export const metadata = {
  title: 'Cylinder Management',
  description: 'Manage all cylinders in the system.',
};

export default function CylindersPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.cylinder.view}>
      <CylinderTable />
    </PermissionGuard>
  );
}
