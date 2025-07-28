import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPrepareOrderDetails } from '@/services/orderService';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import DriverPrepareForm from '../../components/driver-prepare-form';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Order Tidak Ditemukan' };
  }
  try {
    const order = await getPrepareOrderDetails(id);
    return {
      title: `Atur Pengiriman untuk Order: ${order.order_number}`,
    };
  } catch (error) {
    return {
      title: 'Order Tidak Ditemukan',
    };
  }
}

export default async function DriverPreparePage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const order = await getPrepareOrderDetails(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.warehouse.view}>
        <PageTransition>
          <DriverPrepareForm initialOrder={order} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data order dengan ID ${id}:`, error);
    notFound();
  }
}
