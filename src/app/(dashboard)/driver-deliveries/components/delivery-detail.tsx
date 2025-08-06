'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ArrowLeft, Navigation, Package, Clock, MapPin, Phone, Building2, FileText, Truck, CheckCircle, AlertTriangle, Loader2, User, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DriverDeliveryDetail } from '@/types/driver-delivery';
import { toast } from 'sonner';
import { pickupFromWarehouse, completeAtCustomer, getDeliveryById } from '@/services/orderService';
import useSWR from 'swr';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const statusConfig: { [key: string]: { color: string; icon: React.ElementType; action: string | null } } = {
  'Menunggu Pickup': {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    action: 'Ambil Tabung',
  },
  'Dalam Perjalanan': {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Navigation,
    action: 'Pesanan Selesai',
  },
  Selesai: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    action: null,
  },
  Dibatalkan: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
    action: null,
  },
};

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: DriverDeliveryDetail | null;
  onConfirm: (notes: string) => Promise<void>;
}

function ConfirmationModal({ open, onOpenChange, delivery, onConfirm }: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(notes);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating delivery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!delivery) return null;

  const isPickup = delivery.delivery_status === 'Menunggu Pickup';

  const content = (
    <>
      <div className="flex flex-col items-center space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className={`p-4 rounded-full ${isPickup ? 'bg-blue-100' : 'bg-green-100'}`}>
          <Truck className={`h-8 w-8 ${isPickup ? 'text-blue-600' : 'text-green-600'}`} />
        </motion.div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{isPickup ? 'Konfirmasi Pengambilan Tabung' : 'Konfirmasi Penyelesaian Pesanan'}</h3>
          <p className="text-sm text-muted-foreground">{isPickup ? 'Apakah Anda yakin sudah mengambil semua tabung untuk pesanan ini?' : 'Apakah Anda yakin pesanan ini sudah selesai diantar?'}</p>
        </div>

        <div className="w-full p-4 bg-muted rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">No. Pesanan:</span>
            <span className="font-medium">{delivery.order_info.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pelanggan:</span>
            <span className="font-medium">{delivery.customer_info.customer_name}</span>
          </div>
        </div>

        {!isPickup && (
          <div className="w-full space-y-2">
            <Label htmlFor="driver-notes">Catatan Driver (Opsional)</Label>
            <Textarea id="driver-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tambahkan catatan jika ada..." />
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg w-full">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{isPickup ? 'Pastikan semua tabung sudah dimuat ke kendaraan sebelum melanjutkan.' : 'Pastikan pelanggan sudah menerima semua tabung dengan baik.'}</span>
        </div>
      </div>
    </>
  );

  const footer = (
    <div className="flex gap-3 w-full">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="flex-1">
        Batal
      </Button>
      <Button onClick={handleConfirm} disabled={isLoading} className={`flex-1 ${isPickup ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isPickup ? 'Mengambil...' : 'Menyelesaikan...'}
          </>
        ) : (
          <>{isPickup ? 'Ya, Ambil Tabung' : 'Ya, Pesanan Selesai'}</>
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{isPickup ? 'Konfirmasi Pengambilan' : 'Konfirmasi Penyelesaian'}</DrawerTitle>
            <DrawerDescription>Pastikan semua informasi sudah benar sebelum melanjutkan.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{content}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isPickup ? 'Konfirmasi Pengambilan' : 'Konfirmasi Penyelesaian'}</DialogTitle>
          <DialogDescription>Pastikan semua informasi sudah benar sebelum melanjutkan.</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DeliveryDetailView({ initialDelivery }: { initialDelivery: DriverDeliveryDetail }) {
  const router = useRouter();
  const {
    data: delivery,
    error,
    isLoading,
    mutate,
  } = useSWR(`/deliveries/${initialDelivery.delivery_id}`, () => getDeliveryById(initialDelivery.delivery_id).then((res) => res.data), {
    fallbackData: initialDelivery,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleStatusUpdate = async (notes: string) => {
    if (!delivery) return;

    try {
      if (delivery.delivery_status === 'Menunggu Pickup') {
        await pickupFromWarehouse(delivery.delivery_id);
        toast.success('Status berhasil diubah menjadi "Dalam Perjalanan"');
      } else if (delivery.delivery_status === 'Dalam Perjalanan') {
        await completeAtCustomer(delivery.delivery_id, notes);
        toast.success('Pesanan berhasil diselesaikan');
      }
      mutate();

      if (delivery.delivery_status === 'Dalam Perjalanan') {
        setTimeout(() => {
          router.push('/driver-deliveries');
        }, 2000);
      }
    } catch (error: any) {
      toast.error('Gagal mengubah status pengiriman', {
        description: error.response?.data?.message,
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!delivery) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Pengiriman tidak ditemukan</h2>
          <p className="text-muted-foreground mb-4">Pengiriman yang Anda cari tidak dapat ditemukan.</p>
          <Button asChild>
            <Link href="/driver-deliveries">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const config = statusConfig[delivery.delivery_status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="">
        <div className="items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/driver-deliveries">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>
        <div className="flex justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Pengiriman</h1>
            <p className="text-muted-foreground">{delivery.order_info.order_number}</p>
          </div>
          <div>
            <Badge className={`${config.color} border text-sm mt-2 px-3 py-1 text-center`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {delivery.delivery_status}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Informasi Pesanan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Pesanan:</span>
                <span className="font-medium">{delivery.order_info.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe Pesanan:</span>
                <Badge variant="outline">{delivery.order_info.order_type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Pesanan:</span>
                <span className="font-medium">{delivery.order_info.order_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Pesanan:</span>
                <Badge variant="secondary">{delivery.order_info.order_status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-medium">{delivery.order_info.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Catatan Customer:</span>
                <span className="font-medium text-right max-w-[200px]">{delivery.order_info.notes_customer || 'Tidak ada'}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Informasi Pengiriman</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Surat Jalan:</span>
                <span className="font-medium">{delivery.delivery_info.surat_jalan_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking Number:</span>
                <span className="font-medium">{delivery.delivery_info.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">No. Kendaraan:</span>
                <span className="font-medium">{delivery.delivery_info.vehicle_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Pengiriman:</span>
                <span className="font-medium">{delivery.delivery_info.shipping_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu Dispatch:</span>
                <span className="font-medium">{delivery.delivery_info.dispatch_time}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informasi Customer</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{delivery.customer_info.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{delivery.customer_info.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{delivery.customer_info.phone_number}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{delivery.customer_info.email}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Alamat Pengiriman:</p>
                    <p className="text-sm text-muted-foreground">{delivery.customer_info.shipping_address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Contact Person:</p>
                    <p className="text-sm text-muted-foreground">{delivery.customer_info.contact_person}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-4">
        {config.action && (
          <Button className={delivery.delivery_status === 'Menunggu Pickup' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} onClick={() => setShowConfirmation(true)}>
            {delivery.delivery_status === 'Menunggu Pickup' ? <Package className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {config.action}
          </Button>
        )}
      </motion.div>

      <ConfirmationModal open={showConfirmation} onOpenChange={setShowConfirmation} delivery={delivery} onConfirm={(notes) => handleStatusUpdate(notes)} />
    </div>
  );
}
