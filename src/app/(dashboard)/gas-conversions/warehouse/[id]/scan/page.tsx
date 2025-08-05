import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import ScanTaskView from '../../components/scan-task-view';
import { getGasConversionById } from '@/services/gasConversionService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Tugas Tidak Ditemukan' };
  }
  try {
    const task = await getGasConversionById(id);
    return {
      title: `Scan Tugas: ${task.request_number}`,
    };
  } catch (error) {
    return {
      title: 'Tugas Tidak Ditemukan',
    };
  }
}

export default async function ScanTaskPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const task = await getGasConversionById(id);
    return (
      <PageTransition>
        <ScanTaskView initialTask={task} />
      </PageTransition>
    );
  } catch (error) {
    console.error(`Gagal mengambil data tugas dengan ID ${id}:`, error);
    notFound();
  }
}
