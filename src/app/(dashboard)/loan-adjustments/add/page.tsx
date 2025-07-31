import { Metadata } from 'next';
import AddLoanAdjustmentForm from '../components/add-loan-adjustment-form';

export const metadata: Metadata = {
  title: 'Tambah Relasi',
  description: 'Tambahkan pinjaman tabung untuk relasi bisnis',
};

export default function AddLoanAdjustmentPage() {
  return <AddLoanAdjustmentForm />;
}
