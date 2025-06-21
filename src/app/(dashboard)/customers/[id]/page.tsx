import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { PermissionGuard } from '@/components/guards/permission-guard';
import { PERMISSIONS } from '@/config/permissions';
import { getCustomerById } from '@/services/customerService';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { Building, User, Phone, Mail, Home, Pencil, UserCheck, AtSign, Briefcase, Calendar, UserCog, ChevronLeft } from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const data = await getCustomerById(Number(params.id));
  return { title: `Detail Pelanggan: ${data.customer_name}` };
}

const DetailItem = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-8 text-primary pt-1">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-base font-medium">{children}</div>
    </div>
  </div>
);

export default async function CustomerDetailPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  const customer = await getCustomerById(id);
  if (!customer) return notFound();

  return (
    <PermissionGuard requiredPermission={PERMISSIONS.customer.view}>
      <PageTransition>
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
            <Button asChild>
              <Link href={`/customers/${customer.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Ubah Data
              </Link>
            </Button>
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </PermissionGuard>
  );
}
