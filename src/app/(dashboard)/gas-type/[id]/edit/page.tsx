import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getGasTypeById } from '@/services/gasTypeService';
import { GasTypeForm } from '../../components/gas-type-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const id = Number(params.id);
    const data = await getGasTypeById(id);
    return { title: `Edit Gas Type: ${data.name}` };
  } catch (error) {
    return { title: 'Gas Type Not Found' };
  }
}

export default async function EditGasTypePage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }
  const data = await getGasTypeById(id);
  if (!data) notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.gasType.view}>
      <PageTransition>
        <GasTypeForm initialData={data} />
      </PageTransition>
    </PermissionGuard>
  );
}
