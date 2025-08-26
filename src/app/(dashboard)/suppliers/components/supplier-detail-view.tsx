'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { ArrowLeft, Edit, Building, Mail, Phone, User, Trash2, ListPlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteSupplierPriceListItem, getSupplierById } from '@/services/supplierService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from 'sonner';

export default function SupplierDetailView() {
const params = useParams();
  const router = useRouter();
  const supplierId = Number(params.id as string);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const { data: supplier, error } = useSWR(supplierId ? `/suppliers/${supplierId}` : null, () => getSupplierById(supplierId));

  const isLoading = !supplier && !error;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !supplier) {
    return <div>Gagal memuat data supplier atau supplier tidak ditemukan.</div>;
  }

  const handleDelete = async () => {
    if (!selectedProductId) return;

    try {
      await deleteSupplierPriceListItem(supplierId, selectedProductId);
      toast.success('Item daftar harga berhasil dihapus.');
      mutate(`/suppliers/${supplierId}`);
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

  const selectedProduct = supplier.pricelists?.find((p) => p.product.id === selectedProductId)?.product;

  return (
    <>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Hapus Item Harga?"
        description={`Anda yakin ingin menghapus harga untuk produk "${selectedProduct?.name}" dari pelanggan ini?`}
        confirmText="Ya, Hapus"
        onConfirm={handleDelete}
        variant="destructive"
      />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/suppliers">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
              <p className="text-muted-foreground">{supplier.address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/suppliers/${supplierId}/priceList`}>
                <ListPlus className="h-4 w-4 mr-2" />
                Kelola Daftar Harga
              </Link>
            </Button>
            <Button onClick={() => router.push(`/suppliers/${supplierId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Supplier
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informasi Detail Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4" /> Telepon
                </p>
                <p>{supplier.phone_number || '-'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4" /> Alamat
                </p>
                <p>{supplier.address || '-'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-muted-foreground flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" /> Contact Person
                </p>
                <p>{supplier.contact_person || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Harga Khusus</CardTitle>
            </CardHeader>
            <CardContent>
              {supplier.pricelists && supplier.pricelists.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Harga Beli</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplier.pricelists.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
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
                    <Link href={`/suppliers/${supplierId}/priceList`}>Tambahkan sekarang</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
