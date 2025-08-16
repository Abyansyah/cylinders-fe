import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getProductById } from '@/services/productService';
import { ProductForm } from '../../components/product-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getProductById(Number(params.id));
  return { title: `Ubah Produk: ${data.name}` };
}

export default async function EditProductPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);

  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.products.view}>
      <PageTransition>
        <ProductForm initialData={product} />
      </PageTransition>
    </PermissionGuard>
  );
}
