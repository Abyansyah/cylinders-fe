import { Metadata } from 'next';
import { PageTransition } from '@/components/page-transition';
import WarehouseTaskList from './components/warehouse-task-list';

export const metadata: Metadata = {
  title: 'Tugas Gudang - Alih Fungsi Gas',
  description: 'Kelola tugas pengalihan jenis gas yang telah disetujui',
};

export default function WarehouseTasksPage() {
  return (
    <PageTransition>
      <WarehouseTaskList />
    </PageTransition>
  );
}
