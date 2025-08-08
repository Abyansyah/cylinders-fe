import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import DashboardView from './components/dashboard-view';
import { getDashboardData } from '@/services/dashboarService';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard with key performance indicators and reports.',
};

export default async function DashboardPage() {
  const initialDashboardData = await getDashboardData();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.dashboard.view}>
      <PageTransition>
        <DashboardView initialData={initialDashboardData} />
      </PageTransition>
    </PermissionGuard>
  );
}
