import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getCylinderPropertyById } from '@/services/cylinderPropertyService';
import { CylinderPropertyForm } from '../../components/cylinder-property-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const id = Number(params.id);
    const data = await getCylinderPropertyById(id);
    return { title: `Edit Property: ${data.name}` };
  } catch {
    return { title: 'Property Not Found' };
  }
}

export default async function EditCylinderPropertyPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  try {
    const data = await getCylinderPropertyById(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.cylinderProperty.view}>
        <PageTransition>
          <CylinderPropertyForm initialData={data} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    return notFound();
  }
}
