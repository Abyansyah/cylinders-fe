import { Metadata } from 'next';
import TransferLoanAdjustmentForm from '../components/transfer-loan-adjustment-form';

export const metadata: Metadata = {
  title: 'Transfer Relasi',
  description: 'Transfer pinjaman tabung antar relasi bisnis',
};

export default function TransferLoanAdjustmentPage() {
  return <TransferLoanAdjustmentForm />;
}
