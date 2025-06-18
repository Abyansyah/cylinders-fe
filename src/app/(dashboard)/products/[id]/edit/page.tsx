import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getProductById } from '@/services/productService';
import { ProductForm } from '../../components/product-form';
import { getGasTypes } from '@/services/gasTypeService';
import { getCylinderProperties } from '@/services/cylinderPropertyService';

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

  const [product, gasTypes, cylinderProperties] = await Promise.all([getProductById(id), getGasTypes({ limit: 100 }), getCylinderProperties({ limit: 100 })]);

  if (!product) notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.product.manage}>
      <PageTransition>
        <ProductForm initialData={product} gasTypes={gasTypes} cylinderProperties={cylinderProperties} />
      </PageTransition>
    </PermissionGuard>
  );
}
