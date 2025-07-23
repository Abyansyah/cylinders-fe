import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPrepareOrderDetails } from '@/services/orderService';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import PrepareOrderDetailClient from '../components/prepare-order-detail';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params: paramsPromise }: Props): Promise<Metadata> {
  const params = await paramsPromise;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Order Tidak Ditemukan' };
  }
  try {
    const order = await getPrepareOrderDetails(id);
    return {
      title: `Siapkan Order: ${order.order_number}`,
    };
  } catch (error) {
    return {
      title: 'Order Tidak Ditemukan',
    };
  }
}

export default async function PrepareOrderDetailPage({ params: paramsPromise }: Props) {
  const params = await paramsPromise;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const initialOrder = await getPrepareOrderDetails(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.warehousePrepare.view}>
        <PageTransition>
          <PrepareOrderDetailClient initialOrder={initialOrder} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data order dengan ID ${id}:`, error);
    notFound();
  }
}
