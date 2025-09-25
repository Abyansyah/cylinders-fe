import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import React from 'react';
import AdvancedTable from './components/advanced-table';

export const metadata = {
  title: 'Advanced Return Management',
  description: 'Manage all advanced returns in the system.',
};

export default function AdvancedReturnsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.advancedReturn.view}>
      <AdvancedTable />
    </PermissionGuard>
  );
}
