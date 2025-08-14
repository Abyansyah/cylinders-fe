import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import CylinderImport from '../components/cylinder-import';

export const metadata: Metadata = {
  title: 'Import Tabung',
  description: 'Import data tabung dari file Excel',
};

export default function CylinderImportPage() {
  return (
    <PageTransition>
      <CylinderImport />
    </PageTransition>
  );
}
