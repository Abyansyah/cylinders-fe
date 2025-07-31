import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import LoanAdjustmentsList from './components/loan-adjustments-list';

export const metadata: Metadata = {
  title: 'Update Pinjaman Relasi',
  description: 'Kelola penyesuaian pinjaman tabung untuk relasi bisnis',
};

export default function LoanAdjustmentsPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.loanAdjustment.view}>
      <PageTransition>
        <LoanAdjustmentsList />
      </PageTransition>
    </PermissionGuard>
  );
}
