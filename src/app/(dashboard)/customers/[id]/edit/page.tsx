import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getCustomerById } from '@/services/customerService';
import { CustomerForm } from '../../components/customer-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getCustomerById(Number(params.id));
  return { title: `Ubah Pelanggan: ${data.customer_name}` };
}

export default async function EditCustomerPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  const data = await getCustomerById(id);
  if (!data) notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.update}>
      <PageTransition>
        <CustomerForm initialData={data} />
      </PageTransition>
    </PermissionGuard>
  );
}
