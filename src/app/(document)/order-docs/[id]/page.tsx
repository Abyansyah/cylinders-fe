import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { getDeliveryDocument } from '@/services/orderService';
import DeliveryDocumentView from '../components/delivery-document-view';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const document = await getDeliveryDocument(params.id);
    return {
      title: `Surat Jalan: ${document.surat_jalan_number}`,
    };
  } catch (error) {
    return {
      title: 'Dokumen Tidak Ditemukan',
    };
  }
}

export default async function DeliveryDocumentPage(props: Props) {
  const params = await props.params;
  try {
    const document = await getDeliveryDocument(params.id);
    return (
      <PageTransition>
        <DeliveryDocumentView initialDocument={document} />
      </PageTransition>
    );
  } catch (error) {
    console.error(`Gagal mengambil data dokumen dengan ID ${params.id}:`, error);
    notFound();
  }
}
