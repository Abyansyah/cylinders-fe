'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Calendar, User, MapPin, Building, FileText, Download, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageTransition } from '@/components/page-transition';
import { CancelOrderModal } from '../components/cancel-order-modal';
import Link from 'next/link';
import {  cancelOrder } from '@/services/orderService';
import { Order } from '@/types/order';
import useSWR from 'swr';
import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    'Dikonfirmasi Sales': 'bg-blue-100 text-blue-800',
    'Diproses Gudang': 'bg-yellow-100 text-yellow-800',
    'Siap Kirim': 'bg-green-100 text-green-800',
    'Dalam Pengiriman': 'bg-purple-100 text-purple-800',
    Selesai: 'bg-emerald-100 text-emerald-800',
    Dibatalkan: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getOrderTypeColor = (type: string) => {
  return type === 'Sewa' ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800';
};

interface OrderDetailViewProps {
  initialOrder: Order;
}

export default function OrderDetailPage({ initialOrder }: OrderDetailViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { mutate } = useSWR(`/orders/${order.id}`, null, {
    fallbackData: initialOrder,
    onSuccess: (data) => {
      setOrder(data);
    },
  });

  const handleCancelOrder = async (notes: string) => {
    setIsCancelling(true);
    try {
      await cancelOrder(order.id, notes);
      toast.success('Order berhasil dibatalkan.');
      mutate();
      setShowCancelModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!order) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Order tidak ditemukan</h2>
            <p className="text-muted-foreground mb-4">Order tidak ditemukan</p>
            <Button asChild>
              <Link href="/orders">Kembali ke Orders</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const canCancelOrder = order.status !== 'Selesai' && order.status !== 'Dibatalkan Sales';

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
              <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
              <p className="text-muted-foreground">Detail order customer</p>
            </div>
          </div>
          <div className="flex gap-2">
            {canCancelOrder && (
              <Button variant="destructive" size="sm" onClick={() => setShowCancelModal(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Status Order
                    <div className="flex gap-2">
                      <Badge className={getOrderTypeColor(order.order_type)}>{order.order_type}</Badge>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tanggal Order</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.order_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sales</p>
                        <p className="text-sm text-muted-foreground">{order.salesUser.name}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Items Order ({order.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{item.product.name}</h4>
                              <Badge variant="outline">{item.product.sku}</Badge>
                            </div>
                            <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                              </div>
                              <div>
                                <span className="font-medium">Tipe:</span> {item.is_rental ? 'Rental' : 'Pembelian'}
                              </div>
                              {item.unit_price && (
                                <div>
                                  <span className="font-medium">Harga:</span> Rp {item.unit_price.toLocaleString('id-ID')}
                                </div>
                              )}
                            </div>
                            {item.sub_total && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Subtotal:</span> Rp {item.sub_total.toLocaleString('id-ID')}
                              </div>
                            )}
                          </div>
                        </div>
                        {item.notes_petugas_gudang && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Catatan Petugas Gudang:</span> {item.notes_petugas_gudang}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {order.total_amount && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total Amount:</span>
                        <span className="text-xl font-bold">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            {(order.notes_customer || order.notes_internal) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Catatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.notes_customer && (
                      <div>
                        <h4 className="font-medium mb-2">Catatan Customer:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{order.notes_customer}</p>
                      </div>
                    )}
                    {order.notes_internal && (
                      <div>
                        <h4 className="font-medium mb-2">Catatan Internal:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{order.notes_internal}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{order.customer.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.customer.company_name}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>ID Customer: {order.customer.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Information */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Alamat Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{order.shipping_address}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Warehouse Information */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Gudang
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.assigned_warehouse_id === 1 ? 'Gudang Pusat Jakarta' : order.assigned_warehouse_id === 2 ? 'Gudang Surabaya' : 'Gudang Bandung'}</p>
                    <p className="text-sm text-muted-foreground">ID Gudang: {order.assigned_warehouse_id}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="text-sm">
                        <p className="font-medium">Order Dibuat</p>
                        <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="text-sm">
                        <p className="font-medium">Status: {order.status}</p>
                        <p className="text-muted-foreground">{new Date(order.updatedAt).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <CancelOrderModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={handleCancelOrder} orderNumber={order.order_number} isLoading={isCancelling} />
      </div>
    </PageTransition>
  );
}
