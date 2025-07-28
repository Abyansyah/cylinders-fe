'use client';
import { useState } from 'react';
import type React from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Truck, Package, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageTransition } from '@/components/page-transition';
import { toast } from 'sonner';
import type { DeliveryAssignment, Driver } from '@/types/delivery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PrepareOrderDetail } from '@/types/order';
import useSWR from 'swr';
import { getDrivers } from '@/services/userService';
import { createDelivery } from '@/services/orderService';

const SHIPPING_METHODS = ['Dikirim', 'Diambil Sendiri'];

export default function DriverPrepareForm({ initialOrder }: { initialOrder: PrepareOrderDetail }) {
  const router = useRouter();
  const order = initialOrder;

  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [shippingMethod, setShippingMethod] = useState<string>('Dikirim');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: driversResponse, isLoading: isLoadingDrivers } = useSWR('/users/drivers', getDrivers);
  const availableDrivers: Driver[] = driversResponse?.data || [];
  const selectedDriver = availableDrivers.find((driver) => driver.id.toString() === selectedDriverId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDriverId || !vehicleNumber || !shippingMethod) {
      toast.error('Form tidak lengkap', {
        description: 'Mohon lengkapi semua field yang diperlukan',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryAssignment: DeliveryAssignment = {
        order_id: order.id,
        driver_user_id: Number.parseInt(selectedDriverId),
        vehicle_number: vehicleNumber,
        shipping_method: shippingMethod as 'Dikirim',
      };

      await createDelivery(deliveryAssignment);

      toast.success('Pengiriman berhasil diatur!', {
        description: `Order ${order?.order_number} telah diassign ke ${selectedDriver?.name}`,
      });

      router.push('/orders');
    } catch (error: any) {
      toast.error('Gagal mengatur pengiriman', {
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Order tidak ditemukan</h2>
            <p className="text-muted-foreground mb-4">Order dengan ID {typeof order === 'object' && order !== null && 'id' in order ? (order as { id?: string | number }).id : '-'} tidak ditemukan</p>
            <Button asChild>
              <Link href="/orders">Kembali ke Orders</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Atur Pengiriman</h1>
              <p className="text-muted-foreground">Assign driver dan kendaraan untuk pengiriman</p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"
          >
            <Truck className="h-6 w-6" />
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Informasi Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">No. Order</p>
                      <p className="text-lg font-bold">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Customer</p>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tanggal Order</p>
                      <p className="font-medium">{order.order_date}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Form Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="driver" className="text-sm font-medium">
                        Pilih Driver *
                      </Label>
                      <Select value={selectedDriverId} onValueChange={setSelectedDriverId} disabled={isLoadingDrivers}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Pilih driver yang tersedia" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDrivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id.toString()}>
                              <div className="flex items-center gap-3 py-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{driver.name.charAt(0)}</div>
                                <div className="flex-1">
                                  <p className="font-medium">{driver.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{driver.phone_number}</span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle" className="text-sm font-medium">
                        Nomor Kendaraan *
                      </Label>
                      <Input id="vehicle" placeholder="Contoh: B 1234 ABC" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="h-12" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping" className="text-sm font-medium">
                        Metode Pengiriman *
                      </Label>
                      <Select value={shippingMethod} onValueChange={setShippingMethod}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHIPPING_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                {method}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || !selectedDriverId || !vehicleNumber}
                        className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Mengatur Pengiriman...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Atur Pengiriman
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
