import { Metadata } from 'next';
import React from 'react';
import RoleTable from './components/role-table';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Role Management',
  description: 'Manage all roles in the system.',
};

const RolesPage = () => {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.roles.view}>
      <RoleTable />
    </PermissionGuard>
  );
};

export default RolesPage;
