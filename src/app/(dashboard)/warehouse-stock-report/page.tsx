import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import WarehouseStockReportList from './components/warehouse-stock-report-list';

export const metadata: Metadata = {
  title: 'Laporan Stok Gudang',
  description: 'Lihat dan kelola semua laporan stok di gudang.',
};

export default function WarehouseStockReportPage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.warehouse.view}>
      <PageTransition>
        <WarehouseStockReportList />
      </PageTransition>
    </PermissionGuard>
  );
}
