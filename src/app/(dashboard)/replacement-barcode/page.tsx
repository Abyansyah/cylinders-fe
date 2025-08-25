import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import ReplacementBarcodeForm from './components/replacement-barcode-form';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

export const metadata: Metadata = {
  title: 'Replacement Barcode',
  description: 'Ganti barcode tabung yang rusak atau tidak terbaca',
};

export default function ReplacementBarcodePage() {
  return (
    <PermissionGuard requiredPermission={PERMISSIONS.replacementBarcode.view}>
      <PageTransition>
        <ReplacementBarcodeForm />
      </PageTransition>
    </PermissionGuard>
  );
}
