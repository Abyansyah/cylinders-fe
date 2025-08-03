import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import AuditScanView from '../../components/audit-scan-view';
import { getAuditForScan } from '@/services/auditService';

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
    const audit = await getAuditForScan(id);
    return {
      title: `Scan Audit: ${audit.audit_details.audit_number}`,
    };
  } catch (error) {
    return {
      title: 'Audit Tidak Ditemukan',
    };
  }
}

export default async function AuditScanPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  try {
    const audit = await getAuditForScan(id);
    return (
      <PermissionGuard requiredPermission={PERMISSIONS.audit.view_all}>
        <PageTransition>
          <AuditScanView initialAuditData={audit} />
        </PageTransition>
      </PermissionGuard>
    );
  } catch (error) {
    console.error(`Gagal mengambil data audit dengan ID ${id}:`, error);
    notFound();
  }
}
