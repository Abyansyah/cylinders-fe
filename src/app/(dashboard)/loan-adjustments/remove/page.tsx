import { Metadata } from 'next';
import RemoveLoanAdjustmentForm from '../components/remove-loan-adjustment-form';

export const metadata: Metadata = {
  title: 'Hapus Relasi',
  description: 'Hapus pinjaman tabung dari relasi bisnis',
};

export default function RemoveLoanAdjustmentPage() {
  return <RemoveLoanAdjustmentForm />;
}
