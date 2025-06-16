import type { Metadata } from 'next';
import { RoleForm } from '../components/role-form';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Create Role',
  description: 'Add a new role to the system.',
};

export default function CreateRolePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.roles.create}>
      <PageTransition>
        <RoleForm />
      </PageTransition>
    </PermissionGuard>
  );
}
