import { Metadata } from 'next';
import SupplierPriceListForm from '../../components/supplier-pricelist-form';
export const metadata: Metadata = {
  title: 'Kelola Daftar Harga Supplier',
};

export default function SupplierPriceListPage() {
  return <SupplierPriceListForm />;
}
