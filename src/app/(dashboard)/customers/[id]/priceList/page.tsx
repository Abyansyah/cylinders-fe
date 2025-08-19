import { Metadata } from 'next';
import CustomerPriceListForm from '../../components/customer-pricelist-form';

export const metadata: Metadata = {
  title: 'Kelola Daftar Harga Pelanggan',
};

export default function CustomerPriceListPage() {
  return <CustomerPriceListForm />;
}
