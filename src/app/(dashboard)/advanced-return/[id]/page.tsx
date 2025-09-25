import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { getAdvancedReturnDetails } from '@/services/advancedReturnService';
import AdvancedReturnDetailPage from '../components/advanced-detail';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const data = await getAdvancedReturnDetails(params.id);
    return { title: `Detail Pengembalian: ${data.return_number}` };
  } catch (error) {
    return { title: 'Detail Pengembalian Tidak Ditemukan' };
  }
}

export default async function AdvancedDetailPage(props: Props) {
  const params = await props.params;
  try {
    const advancedData = await getAdvancedReturnDetails(params.id);
    if (!advancedData) {
      notFound();
    }

    return (
      <>
        <AdvancedReturnDetailPage returnData={advancedData} />
      </>
    );
  } catch (error) {
    console.error('Failed to fetch advanced return details:', error);
    notFound();
  }
}
