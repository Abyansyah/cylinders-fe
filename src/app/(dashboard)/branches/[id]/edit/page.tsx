import { PermissionGuard } from '@/components/guards/permission-guard';
import { PageTransition } from '@/components/page-transition';
import { PERMISSIONS } from '@/config/permissions';
import { getBranchById } from '@/services/branchService';
import { notFound } from 'next/navigation';
import { BranchForm } from '../../components/branch-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const data = await getBranchById(Number(params.id));
  return { title: `Ubah Cabang: ${data.name}` };
}

export default async function EditBranchPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  const data = await getBranchById(id);
  if (!data) notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.branch.update}>
      <PageTransition>
        <BranchForm initialData={data} />
      </PageTransition>
    </PermissionGuard>
  );
}
