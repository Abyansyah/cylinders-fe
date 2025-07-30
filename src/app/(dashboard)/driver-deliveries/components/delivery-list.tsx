'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Navigation, Package, Clock, MapPin, Phone, Building2, Eye, Truck, CheckCircle, AlertTriangle, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';
import type { DriverDelivery } from '@/types/driver-delivery';
import { getDriverDeliveries, pickupFromWarehouse, completeAtCustomer } from '@/services/orderService';
import { toast } from 'sonner';
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
  delivery: DriverDelivery | null;
  onConfirm: (notes: string) => Promise<void>;
}

function ConfirmationModal({ open, onOpenChange, delivery, onConfirm }: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();
  const [notes, setNotes] = useState('');

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

  const config = statusConfig[delivery.status as keyof typeof statusConfig];
  const isPickup = delivery.status === 'Menunggu Pickup';

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
            <span className="font-medium">{delivery.order.order_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pelanggan:</span>
            <span className="font-medium">{delivery.order.customer.customer_name}</span>
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
      <Drawer open={open} onOpenChange={onOpenChange}>
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

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }: { title: string; value: string | number; subtitle: string; icon: any; gradient: string; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Card className={`relative overflow-hidden border-0 shadow-lg ${gradient} text-white`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">{title}</p>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: delay + 0.3, type: 'spring', stiffness: 200 }} className="text-3xl font-bold">
                {value}
              </motion.div>
              <p className="text-white/70 text-xs">{subtitle}</p>
            </div>
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <Icon className="h-6 w-6" />
            </motion.div>
          </div>

          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function DriverDeliveriesList() {
  const { data: deliveriesResponse, error, isLoading, mutate } = useSWR('/deliveries/driver/active', getDriverDeliveries);
  const deliveries = deliveriesResponse?.data || [];

  const [selectedDelivery, setSelectedDelivery] = useState<DriverDelivery | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleStatusUpdate = async (notes: string) => {
    if (!selectedDelivery) return;

    try {
      if (selectedDelivery.status === 'Menunggu Pickup') {
        await pickupFromWarehouse(selectedDelivery.id);
        toast.success('Status berhasil diubah menjadi "Dalam Perjalanan"');
      } else if (selectedDelivery.status === 'Dalam Perjalanan') {
        await completeAtCustomer(selectedDelivery.id, notes);
        toast.success('Pesanan berhasil diselesaikan');
      }
      mutate();
    } catch (error: any) {
      toast.error('Gagal mengubah status pengiriman', {
        description: error.response?.data?.message,
      });
    }
  };

  const filteredDeliveries = deliveries.filter((delivery: DriverDelivery) => {
    if (statusFilter === 'all') return true;
    return delivery.status === statusFilter;
  });

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d: DriverDelivery) => d.status === 'Menunggu Pickup').length,
    inProgress: deliveries.filter((d: DriverDelivery) => d.status === 'Dalam Perjalanan').length,
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengiriman Saya</h1>
          <p className="text-muted-foreground">Kelola semua pengiriman yang ditugaskan kepada Anda</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Total Pengiriman" value={stats.total} subtitle="Semua pengiriman aktif" icon={Package} gradient="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.1} />
        <StatCard title="Menunggu Pickup" value={stats.pending} subtitle="Siap untuk diambil" icon={Clock} gradient="bg-gradient-to-br from-yellow-500 to-yellow-600" delay={0.2} />
        <StatCard title="Dalam Perjalanan" value={stats.inProgress} subtitle="Sedang diantar" icon={Navigation} gradient="bg-gradient-to-br from-green-500 to-green-600" delay={0.3} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] h-11">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Menunggu Pickup">Menunggu Pickup</SelectItem>
            <SelectItem value="Dalam Perjalanan">Dalam Perjalanan</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <div className="space-y-4">
        {filteredDeliveries.map((delivery, index) => {
          const config = statusConfig[delivery.status as keyof typeof statusConfig];
          const StatusIcon = config.icon;

          return (
            <motion.div key={delivery.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.1 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{delivery.order.order_number}</h3>
                    </div>
                    <Badge className={`${config.color} border`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {delivery.status}
                    </Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{delivery.order.customer.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{delivery.order.customer.phone_number}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{delivery.order.shipping_address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>{delivery.vehicle_number}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/driver-deliveries/${delivery.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Detail
                      </Link>
                    </Button>

                    {config.action && (
                      <Button
                        size="sm"
                        className={delivery.status === 'Menunggu Pickup' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowConfirmation(true);
                        }}
                      >
                        {delivery.status === 'Menunggu Pickup' ? <Package className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        {config.action}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredDeliveries.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{statusFilter === 'all' ? 'Tidak ada pengiriman' : `Tidak ada pengiriman dengan status "${statusFilter}"`}</h3>
          <p className="text-muted-foreground">{statusFilter === 'all' ? 'Belum ada pengiriman yang ditugaskan kepada Anda.' : 'Coba ubah filter untuk melihat pengiriman lainnya.'}</p>
        </motion.div>
      )}

      <ConfirmationModal open={showConfirmation} onOpenChange={setShowConfirmation} delivery={selectedDelivery} onConfirm={(notes) => handleStatusUpdate(notes)} />
    </div>
  );
}
