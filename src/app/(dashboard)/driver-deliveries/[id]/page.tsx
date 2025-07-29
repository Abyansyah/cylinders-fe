import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getDeliveryById } from '@/services/orderService';
import DeliveryDetailView from '../components/delivery-detail';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Pengiriman Tidak Ditemukan' };
  }
  try {
    const delivery = await getDeliveryById(id);
    return {
      title: `Detail Pengiriman: ${delivery.data.order_info.order_number}`,
    };
  } catch (error) {
    return {
      title: 'Pengiriman Tidak Ditemukan',
    };
  }
}

export default async function DriverDeliveryDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const delivery = await getDeliveryById(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.driverDelivery.view}>
        <PageTransition>
          <DeliveryDetailView initialDelivery={delivery.data} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data pengiriman dengan ID ${id}:`, error);
    notFound();
  }
}
