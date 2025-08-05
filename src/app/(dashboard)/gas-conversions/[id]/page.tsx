import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import GasConversionDetailView from '../components/gas-conversion-detail-view';
import { getGasConversionDetail } from '@/services/gasConversionService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Detail Alih Fungsi Tidak Ditemukan' };
  }
  try {
    const response = await getGasConversionDetail(id);
    return {
      title: `Detail Alih Fungsi: ${response.data.request_header.request_number}`,
    };
  } catch (error) {
    return {
      title: 'Detail Alih Fungsi Tidak Ditemukan',
    };
  }
}

export default async function GasConversionDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const response = await getGasConversionDetail(id);
    return (
      <PageTransition>
        <GasConversionDetailView initialData={response.data} />
      </PageTransition>
    );
  } catch (error) {
    console.error(`Gagal mengambil data alih fungsi dengan ID ${id}:`, error);
    notFound();
  }
}
