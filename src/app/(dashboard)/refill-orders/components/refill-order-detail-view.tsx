'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Building2, User, Calendar, Truck, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { getRefillOrderById } from '@/services/refillOrderService';
import { ConfirmDispatchDialog } from './confirm-dispatch-dialog';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PARTIALLY_RECEIVED':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    PENDING_CONFIRMATION: 'Menunggu Konfirmasi',
    CONFIRMED: 'Dikonfirmasi',
    PARTIALLY_RECEIVED: 'Diterima Sebagian',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
};

export default function RefillOrderDetailView() {
  const params = useParams();
  const orderId = Number(params.id as string);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const router = useRouter();
  const { checkPermission } = usePermission();

  const { data: order, error } = useSWR(orderId ? `/refill-orders/${orderId}` : null, () => getRefillOrderById(orderId));

  const handlePrintDeliveryNote = () => {
    if (order?.systemNumber) {
      router.push(`/refill-orders/${order.id}/delivery-note`);
    }
  };

  const groupedDetails = useMemo(() => {
    if (!order) return {};
    return order.details.reduce((acc, detail) => {
      const productId = detail.product.id;
      if (!acc[productId]) {
        acc[productId] = {
          product: detail.product,
          cylinders: [],
        };
      }
      acc[productId].cylinders.push(detail);
      return acc;
    }, {} as Record<string, { product: any; cylinders: any[] }>);
  }, [order]);

  const isLoading = !order && !error;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !order) {
    return <div>Order not found</div>;
  }

  const isPending = order.status === 'PENDING_CONFIRMATION' && checkPermission(PERMISSIONS.refillOrder.approve);
  const canReceive = (order.status === 'IN_TRANSIT_TO_SUPPLIER' || order.status === 'PARTIALLY_RECEIVED') && checkPermission(PERMISSIONS.refillOrder.recieve);
  const returnedCount = order.details.filter((d) => d.isReturned).length;
  const totalCount = order.details.length;

  return (
    <>
      {isPending && <ConfirmDispatchDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen} order={order} />}

      <div className="container mx-auto p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/refill-orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Detail Order Refill</h1>
              <p className="text-muted-foreground">RO/2025/08/{order.id.toString().padStart(3, '0')}</p>
            </div>
            <Badge className={getStatusBadgeColor(order.status)}>{getStatusLabel(order.status)}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Konten Utama */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informasi Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informasi Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Supplier</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.supplier.name}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Pemohon</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.requester.name}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Tanggal Pengiriman</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{new Date(order.dispatchDate).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {!isPending && order.approver && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Penyetuju</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{order.approver.name}</span>
                          </div>
                        </div>
                      )}

                      {!isPending && order.driver && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Driver</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{order.driver.name}</span>
                          </div>
                        </div>
                      )}

                      {!isPending && order.sjNumber && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Nomor SJ</Label>
                          <div className="font-medium mt-1">{order.sjNumber}</div>
                        </div>
                      )}

                      {!isPending && order.systemNumber && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Nomor Sistem</Label>
                          <div className="font-medium mt-1">{order.systemNumber}</div>
                        </div>
                      )}

                      {!isPending && order.vehiclePlateNumber && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Plat Kendaraan</Label>
                          <div className="font-medium mt-1">{order.vehiclePlateNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daftar Tabung */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Daftar Tabung ({totalCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.values(groupedDetails).map(({ product, cylinders }, index) => (
                      <Collapsible key={product.id} defaultOpen className="border rounded-lg p-4">
                        <CollapsibleTrigger className="w-full flex justify-between items-center">
                          <div className="text-left">
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.sku}</p>
                          </div>
                          <Badge variant="secondary">{cylinders.length} Tabung</Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 space-y-3">
                          {cylinders.map((detail) => (
                            <motion.div key={detail.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="p-3 bg-gray-50 rounded-md">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Barcode: {detail.cylinder.barcode_id}</span>
                                    <Badge variant="outline">SN: {detail.cylinder.serial_number}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Status:</span>
                                    <Badge variant="secondary">{detail.cylinder.status}</Badge>
                                  </div>
                                  {detail.isReturned && detail.returnedAt && <div className="text-sm text-green-600">Dikembalikan: {new Date(detail.returnedAt).toLocaleString('id-ID')}</div>}
                                </div>
                                <div className="flex items-center gap-2">{detail.isReturned ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-orange-500" />}</div>
                              </div>
                            </motion.div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ringkasan */}
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Tabung:</span>
                      <Badge variant="secondary">{totalCount}</Badge>
                    </div>
                    {!isPending && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dikembalikan:</span>
                          <Badge variant="outline" className="text-green-600">
                            {returnedCount}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Belum Kembali:</span>
                          <Badge variant="outline" className="text-orange-600">
                            {totalCount - returnedCount}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Produk:</Label>
                    {Object.values(groupedDetails).map(({ product, cylinders }) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate">{product.name}</span>
                        <Badge variant="outline">{cylinders.length}</Badge>
                      </div>
                    ))}
                  </div>

                  {isPending && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <Button className="w-full" variant="default" onClick={() => setIsConfirmDialogOpen(true)}>
                          Setujui Order
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Aksi */}
              {!isPending && (
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full bg-transparent" variant="outline" onClick={handlePrintDeliveryNote} disabled={!order.systemNumber}>
                      Cetak Surat Jalan
                    </Button>
                    {canReceive && (
                      <Button className="w-full" onClick={() => router.push(`/refill-orders/${order.id}/receive`)}>
                        Penerimaan Tabung
                      </Button>
                    )}
                    {order.status === 'PARTIALLY_RECEIVED' && (
                      <Button className="w-full" variant="default">
                        Tandai Selesai
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
