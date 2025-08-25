import { Metadata } from 'next';
import LoanCardView from './components/loan-card-view';

export const metadata: Metadata = {
  title: 'Kartu Pinjaman Relasi',
};

export default function LoanCardPage() {
  return <LoanCardView />;
}
