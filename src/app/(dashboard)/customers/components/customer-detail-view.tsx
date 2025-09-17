'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { deleteCustomerPriceListItem, getCustomerById } from '@/services/customerService';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { Building, User, Phone, Mail, Home, UserCheck, AtSign, Briefcase, Calendar, UserCog, ChevronLeft, Edit, ListPlus, Trash2, Wallet2Icon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

type Props = {
  params: Promise<{ id: string }>;
};

const DetailItem = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 text-primary pt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-base font-medium">{children}</div>
    </div>
  </div>
);

export default function CustomerDetailView() {
  const params = useParams();
  const customerId = Number(params.id as string);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: customer, error } = useSWR(customerId ? `/customers/${customerId}` : null, () => getCustomerById(customerId));

  const handleDelete = async () => {
    if (!selectedProductId) return;

    try {
      await deleteCustomerPriceListItem(customerId, selectedProductId);
      toast.success('Item daftar harga berhasil dihapus.');
      mutate(`/customers/${customerId}`);
    } catch (error: any) {
      toast.error('Gagal menghapus item.', {
        description: error?.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  const openDeleteDialog = (productId: number) => {
    setSelectedProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  if (error) return <div>Gagal memuat data pelanggan.</div>;
  if (!customer) return <div>Memuat...</div>;

  const selectedProduct = customer.pricelists.find((p) => p.product.id === selectedProductId)?.product;

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.view}>
      <PageTransition>
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Hapus Item Harga?"
          description={`Anda yakin ingin menghapus harga untuk produk "${selectedProduct?.name}" dari pelanggan ini?`}
          confirmText="Ya, Hapus"
          onConfirm={handleDelete}
          variant="destructive"
        />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Link href={'/customers'}>
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{customer.customer_name || customer.company_name}</h1>
                <p className="text-muted-foreground">Detail lengkap untuk produk.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/customers/${customerId}/priceList`}>
                  <ListPlus className="h-4 w-4 mr-2" />
                  Kelola Daftar Harga
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/customers/${customerId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Informasi Kontak & Alamat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DetailItem icon={<Building size={20} />} label="Nama Perusahaan">
                  <p>{customer.company_name || 'Perorangan'}</p>
                </DetailItem>
                <DetailItem icon={<User size={20} />} label="Kontak Person">
                  <p>{customer.contact_person}</p>
                </DetailItem>
                <Separator />
                <DetailItem icon={<Phone size={20} />} label="Nomor Telepon">
                  <p>{customer.phone_number}</p>
                </DetailItem>
                <DetailItem icon={<Mail size={20} />} label="Email">
                  <p>{customer.email}</p>
                </DetailItem>
                <Separator />
                <DetailItem icon={<Home size={20} />} label="Alamat Pengiriman Utama">
                  <p className="whitespace-pre-wrap">{customer.shipping_address_default}</p>
                </DetailItem>
                <DetailItem icon={<Home size={20} />} label="Tipe Mitra">
                  <p className="whitespace-pre-wrap">
                    {customer.relation_type
                      ?.toLocaleLowerCase()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </p>
                </DetailItem>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Akun</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DetailItem icon={<UserCheck size={20} />} label="Username Akun">
                    <Badge variant="outline">{customer.userAccount.username}</Badge>
                  </DetailItem>
                  <DetailItem icon={<AtSign size={20} />} label="Email Akun">
                    <p>{customer.userAccount.email}</p>
                  </DetailItem>
                  <DetailItem icon={<UserCog size={20} />} label="Status Akun">
                    <Badge variant={customer.userAccount.is_active ? 'default' : 'destructive'}>{customer.userAccount.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </DetailItem>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Tambahan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DetailItem icon={<Briefcase size={20} />} label="Tipe Pelanggan">
                    <p>{customer.customer_type}</p>
                  </DetailItem>
                  <DetailItem icon={<User size={20} />} label="Dibuat Oleh">
                    <p>
                      {customer.createdBy.name} (@{customer.createdBy.username})
                    </p>
                  </DetailItem>
                  <DetailItem icon={<Calendar size={20} />} label="Tanggal Dibuat">
                    <p>{format(new Date(customer.createdAt), 'd MMMM yyyy, HH:mm', { locale: indonesiaLocale })}</p>
                  </DetailItem>
                  <DetailItem icon={<Wallet2Icon size={20} />} label="Tempo Pembayaran">
                    <p className="">{customer.payment_term_days ? `${customer.payment_term_days} hari` : '-'}</p>
                  </DetailItem>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Harga Khusus</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.pricelists && customer.pricelists.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-right">Harga Sewa</TableHead>
                          <TableHead className="text-right">Harga Beli</TableHead>
                          <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.pricelists.map((item) => (
                          <TableRow key={item.product.id}>
                            <TableCell className="font-medium">{item.product.name}</TableCell>
                            <TableCell className="text-right">{item.rentPrice ? formatCurrency(Number(item.rentPrice)) : '-'}</TableCell>
                            <TableCell className="text-right">{item.buyPrice ? formatCurrency(Number(item.buyPrice)) : '-'}</TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => openDeleteDialog(item.product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Belum ada daftar harga khusus untuk pelanggan ini.</p>
                      <Button variant="link">
                        <Link href={`/customers/${customerId}/priceList`}>Tambahkan sekarang</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </PermissionGuard>
  );
}
