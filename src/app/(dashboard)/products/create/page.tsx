import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { ProductForm } from '../components/product-form';
import { getGasTypes } from '@/services/gasTypeService';
import { getCylinderProperties } from '@/services/cylinderPropertyService';
import { GasTypesApiResponse } from '@/types/gas-type';

export const metadata: Metadata = { title: 'Buat Produk Baru' };

export default async function CreateProductPage() {
  const [gasTypes, cylinderProperties] = await Promise.all([getGasTypes({ limit: 100 }), getCylinderProperties({ limit: 100 })]);

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.product.manage}>
      <PageTransition>
        <ProductForm gasTypes={gasTypes} cylinderProperties={cylinderProperties} />
      </PageTransition>
    </PermissionGuard>
  );
}
