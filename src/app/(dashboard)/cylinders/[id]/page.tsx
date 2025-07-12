import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { getCylinderDetailsByBarcode } from '@/services/cylinderService';
import CylinderDetailView from '../components/cylinder-view';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const data = await getCylinderDetailsByBarcode(params.id);
    return { title: `Detail Tabung: ${data.serial_number}` };
  } catch (error) {
    return { title: 'Detail Tabung Tidak Ditemukan' };
  }
}

export default async function CylinderDetailPage(props: Props) {
  const params = await props.params;
  try {
    const cylinderData = await getCylinderDetailsByBarcode(params.id);
    if (!cylinderData) {
      notFound();
    }

    return (
      <PermissionGuard requiredPermission={PERMISSIONS.cylinder.view}>
        <CylinderDetailView cylinder={cylinderData} />
      </PermissionGuard>
    );
  } catch (error) {
    console.error('Failed to fetch cylinder details:', error);
    notFound();
  }
}
