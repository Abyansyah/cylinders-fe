import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRoleById } from '@/services/roleService';
import { RoleForm } from '../../components/role-form';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const id = Number(params.id);
    const role = await getRoleById(id);
    return {
      title: `Edit Role: ${role.role_name}`,
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Role Not Found',
    };
  }
}

export default async function EditRolePage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  let role;
  try {
    role = await getRoleById(id);
  } catch (error) {
    console.error(`Failed to fetch role with ID ${id}:`, error);
    notFound();
  }

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.roles.update}>
      <PageTransition>
        <RoleForm initialData={role} />
      </PageTransition>
    </PermissionGuard>
  );
}
