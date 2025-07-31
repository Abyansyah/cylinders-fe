import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import LoanAdjustmentDetailView from '../components/loan-adjustment-detail-view';
import { getLoanAdjustmentById } from '@/services/loanAdjustmentService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Penyesuaian Tidak Ditemukan' };
  }
  try {
    const adjustment = await getLoanAdjustmentById(id);
    return {
      title: `Detail Penyesuaian: ${adjustment.adjustment_number}`,
    };
  } catch (error) {
    return {
      title: 'Penyesuaian Tidak Ditemukan',
    };
  }
}

export default async function LoanAdjustmentDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const adjustment = await getLoanAdjustmentById(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.loanAdjustment.view_detail}>
        <PageTransition>
          <LoanAdjustmentDetailView initialAdjustment={adjustment} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data penyesuaian dengan ID ${id}:`, error);
    notFound();
  }
}
