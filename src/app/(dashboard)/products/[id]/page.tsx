import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getProductById } from '@/services/productService';
import { FileText, Beaker, Package, Pencil, Calendar, Hash } from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getProductById(Number(params.id));
  return { title: `Detail Produk: ${data.name}` };
}

const DetailItem = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-8 text-muted-foreground">{icon}</div>
    <div className="grid gap-1.5">
      <p className="text-sm font-semibold">{label}</p>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  </div>
);

export default async function ProductDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  const product = await getProductById(id);
  if (!product) return notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.products.view}>
      <PageTransition>
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">Detail lengkap untuk produk.</p>
            </div>
            <Button asChild>
              <Link href={`/products/${product.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Ubah Produk
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem icon={<FileText size={18} />} label="Deskripsi">
                    <p>{product.description || '-'}</p>
                  </DetailItem>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <DetailItem icon={<Hash size={18} />} label="SKU">
                      <Badge variant="outline">{product.sku || 'Tidak ada'}</Badge>
                    </DetailItem>
                    <DetailItem icon={<Calendar size={18} />} label="Status">
                      <Badge variant={product.is_active ? 'default' : 'destructive'}>{product.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                    </DetailItem>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tipe Gas</CardTitle>
                  <CardDescription>{product.gasType.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem icon={<Beaker size={18} />} label="Deskripsi Gas">
                    <p>{product.gasType.description || '-'}</p>
                  </DetailItem>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Properti Tabung</CardTitle>
                  <CardDescription>{product.cylinderProperty.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem icon={<Package size={18} />} label="Material & Ukuran">
                    <p>
                      {product.cylinderProperty.material}, {product.cylinderProperty.size_cubic_meter} m³
                    </p>
                  </DetailItem>
                  <Separator />
                  <DetailItem icon={<Calendar size={18} />} label="Masa Pakai Maksimal">
                    <p>{product.cylinderProperty.max_age_years} tahun</p>
                  </DetailItem>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </PermissionGuard>
  );
}
