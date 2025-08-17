import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { getSupplierById } from '@/services/supplierService';
import { SupplierForm } from '../../components/supplier-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getSupplierById(Number(params.id));
  return { title: `Ubah Supplier: ${data.name}` };
}

export default async function EditSupplierPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  const data = await getSupplierById(id);
  if (!data) notFound();

  return (
    <PageTransition>
      <SupplierForm initialData={data} />
    </PageTransition>
  );
}
