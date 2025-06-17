import { notFound } from 'next/navigation';
import { getRoleById } from '@/services/roleService';
import { fetchAllPermissions } from '@/services/permissionService';
import { PermissionForm } from './components/permission-form';
import type { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const id = Number(params.id);
    const role = await getRoleById(id);
    return { title: `Manage Permissions for ${role.role_name}` };
  } catch (error) {
    return { title: 'Role Not Found' };
  }
}

export default async function PermissionsPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  try {
    const [role, allPermissions] = await Promise.all([getRoleById(id), fetchAllPermissions()]);

    return (
      <PageTransition>
        <PermissionForm initialRole={role} allPermissions={allPermissions} />
      </PageTransition>
    );
  } catch (error) {
    console.error('Failed to fetch role or permissions:', error);
    return notFound();
  }
}
