import type { Metadata } from 'next';
import { getCylinderDetailsByBarcode } from '@/services/cylinderService';
import { getGasTypes } from '@/services/gasTypeService';
import EditCylinderView from '../../components/cylinder-from-edit';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { PERMISSIONS } from '@/config/permissions';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { Cylinder } from '@/types/cylinder';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Edit Status Tabung Gas',
  description: 'Halaman untuk mengubah status tabung gas.',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CylinderEditPage(props: Props) {
  const params = await props.params;
  try {
    const cylinderData = await getCylinderDetailsByBarcode(params.id);
    const cylinder = cylinderData as Cylinder;

    if (!cylinder) {
      return (
        <PageTransition>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Tabung Gas Tidak Ditemukan</h2>
            <p className="text-muted-foreground mt-2">Data untuk barcode ID {params.id} tidak tersedia.</p>

            <Link href={'/cylinders'}>
              <Button>Kembali ke Daftar Tabung</Button>
            </Link>
          </div>
        </PageTransition>
      );
    }

    return (
      <PermissionGuard requiredPermission={PERMISSIONS.cylinder.update}>
        <EditCylinderView cylinder={cylinder} />
      </PermissionGuard>
    );
  } catch (error) {
    return (
      <PageTransition>
        <div className="text-center py-12 text-red-600">
          <h2 className="text-xl font-semibold">Terjadi Kesalahan</h2>
          <p className="text-muted-foreground mt-2">Gagal memuat data tabung. Silakan coba lagi nanti.</p>
          <Link href={'/cylinders'} className="mt-4">
            <Button>Kembali ke Daftar Tabung</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }
}
