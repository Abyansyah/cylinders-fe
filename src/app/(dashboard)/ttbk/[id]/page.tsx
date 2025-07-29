import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getTTBKById } from '@/services/ttbkService';
import TTBKDetailView from '../components/ttbk-detail-view';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'TTBK Tidak Ditemukan' };
  }
  try {
    const ttbk = await getTTBKById(id);
    return {
      title: `Detail TTBK: ${ttbk.ttbk_number}`,
    };
  } catch (error) {
    return {
      title: 'TTBK Tidak Ditemukan',
    };
  }
}

export default async function TTBKDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const ttbk = await getTTBKById(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.returnreceipt.view_detail}>
        <PageTransition>
          <TTBKDetailView initialTTBK={ttbk} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data TTBK dengan ID ${id}:`, error);
    notFound();
  }
}
