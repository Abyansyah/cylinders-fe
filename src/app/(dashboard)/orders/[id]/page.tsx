import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getOrderById } from '@/services/orderService';
import OrderDetailView from '../components/order-detail-view';

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
    const order = await getOrderById(id);
    return {
      title: `Detail Order: ${order.order_number}`,
    };
  } catch (error) {
    return {
      title: 'Order Tidak Ditemukan',
    };
  }
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const order = await getOrderById(id);

    return <OrderDetailView initialOrder={order} />;
  } catch (error) {
    console.error(`Gagal mengambil data order dengan ID ${id}:`, error);
    notFound();
  }
}
