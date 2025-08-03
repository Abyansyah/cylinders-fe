import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import AuditDetailView from '../components/audit-detail-view';
import { getAuditById } from '@/services/auditService';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return { title: 'Audit Tidak Ditemukan' };
  }
  try {
    const audit = await getAuditById(id);
    return {
      title: `Detail Audit: ${audit.audit_details.audit_number}`,
    };
  } catch (error) {
    return {
      title: 'Audit Tidak Ditemukan',
    };
  }
}

export default async function AuditDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const audit = await getAuditById(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.audit.view_all}>
        <PageTransition>
          <AuditDetailView initialAuditData={audit} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data audit dengan ID ${id}:`, error);
    notFound();
  }
}
