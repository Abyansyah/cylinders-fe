import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getWarehouseById } from '@/services/warehouseService';
import { WarehouseForm } from '../../components/warehouse-form';

type Props = { 
    params: Promise<{ id: string }>
 };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getWarehouseById(Number(params.id));
  return { title: `Ubah Gudang: ${data.name}` };
}

export default async function EditWarehousePage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  const data = await getWarehouseById(id);
  if (!data) notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.warehouse.update}>
      <PageTransition>
        <WarehouseForm initialData={data} />
      </PageTransition>
    </PermissionGuard>
  );
}
