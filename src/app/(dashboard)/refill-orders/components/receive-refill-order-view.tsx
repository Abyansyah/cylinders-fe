'use client';

import { motion } from 'framer-motion';
import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Scan, Package, CheckCircle, XCircle, AlertCircle, Trash2, Plus, FileText, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarcodeScanner } from '@/components/features/barcode-scanner';

import { getRefillOrderById, receiveRefillOrderItems } from '@/services/refillOrderService';
import type { RefillOrderDetail, RefillOrderItemDetail } from '@/types/refill-order';
import { getStatusBadgeColor, getStatusLabel } from '@/constants/refill-order';

interface ScannedItem {
  id: string;
  identifier: string;
  type: 'barcode' | 'serial';
  orderItem?: RefillOrderItemDetail;
  status: 'found' | 'not_found' | 'already_received_api' | 'already_scanned_session';
  timestamp: Date;
}

export default function ReceiveRefillOrderView() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id as string);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: order, error, isLoading: isLoadingOrder } = useSWR(orderId ? `/refill-orders/${orderId}` : null, () => getRefillOrderById(orderId));

  const [inputValue, setInputValue] = useState('');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, [scannedItems]);

  const findOrderItem = (identifier: string): { item?: RefillOrderItemDetail; status: ScannedItem['status'] } => {
    if (!order) return { status: 'not_found' };

    const alreadyScanned = scannedItems.find((scanned) => scanned.identifier === identifier);
    if (alreadyScanned) {
      return { status: 'already_scanned_session' };
    }

    const foundDetail = order.details.find((detail) => detail.cylinder.barcode_id === identifier || detail.cylinder.serial_number === identifier);

    if (!foundDetail) {
      return { status: 'not_found' };
    }

    if (foundDetail.isReturned) {
      return { item: foundDetail, status: 'already_received_api' };
    }

    return { item: foundDetail, status: 'found' };
  };

  const handleScan = async (barcodeValue?: string) => {
    const identifier = (barcodeValue || inputValue).trim();
    if (!identifier) return;

    if (showScanner) setShowScanner(false);
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { item, status } = findOrderItem(identifier);

    const scannedItem: ScannedItem = {
      id: `${identifier}-${Date.now()}`,
      identifier,
      orderItem: item,
      type: item?.cylinder.barcode_id === identifier ? 'barcode' : 'serial',
      status,
      timestamp: new Date(),
    };

    setScannedItems((prev) => [scannedItem, ...prev]);

    switch (status) {
      case 'found':
        toast.success(`Tabung ditemukan: ${item?.product.name}`);
        break;
      case 'not_found':
        toast.error(`Tabung tidak ditemukan dalam order ini.`);
        break;
      case 'already_received_api':
        toast.warning(`Tabung sudah diterima oleh sistem.`);
        break;
      case 'already_scanned_session':
        toast.info(`Tabung sudah ada di daftar scan saat ini.`);
        break;
    }

    setInputValue('');
    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const removeScannedItem = (id: string) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item dihapus dari daftar.');
  };

  const handleSubmit = async () => {
    const validItems = scannedItems.filter((item) => item.status === 'found');
    const identifiersToSubmit = validItems.map((item) => item.identifier);

    if (identifiersToSubmit.length === 0) {
      toast.error('Tidak ada item valid untuk diterima.');
      return;
    }

    setIsProcessing(true);
    try {
      await receiveRefillOrderItems(orderId, { identifiers: identifiersToSubmit });
      toast.success(`${identifiersToSubmit.length} tabung berhasil diterima.`);
      mutate(`/refill-orders/${orderId}`);
      setScannedItems([]); // Clear list after successful submission
    } catch (error: any) {
      toast.error('Gagal menerima tabung.', {
        description: error?.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: ScannedItem['status']) => {
    switch (status) {
      case 'found':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'not_found':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'already_received_api':
      case 'already_scanned_session':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ScannedItem['status']) => {
    switch (status) {
      case 'found':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Valid</Badge>;
      case 'not_found':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Tidak Ditemukan</Badge>;
      case 'already_received_api':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Sudah Diterima</Badge>;
      case 'already_scanned_session':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sudah di-Scan</Badge>;
    }
  };

  if (isLoadingOrder) return <div>Loading...</div>;
  if (error || !order) return <div>Order not found.</div>;

  const validItemsCount = scannedItems.filter((item) => item.status === 'found').length;
  const totalOrderItems = order.details.length;
  const receivedItems = order.details.filter((item) => item.isReturned).length;

  return (
    <>
      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/refill-orders/${orderId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Penerimaan Tabung</h1>
                <Badge className={`${getStatusBadgeColor(order.status)} flex items-center gap-1 w-fit`}>{getStatusLabel(order.status)}</Badge>
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                RO/2025/08/{orderId.toString().padStart(3, '0')} - {order.supplier.name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Scanner Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5" />
                    Scan atau Input Tabung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scanner-input">Barcode atau Serial Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="scanner-input"
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Scan barcode atau ketik serial number..."
                        className="flex-1 text-base md:text-sm"
                        disabled={isProcessing}
                        autoComplete="off"
                      />
                      <Button onClick={() => setShowScanner(true)} variant="outline">
                        Scan
                      </Button>
                      <Button onClick={() => handleScan()} disabled={!inputValue.trim() || isProcessing} className="shrink-0">
                        {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Tekan Enter atau klik tombol + untuk menambahkan item</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{scannedItems.length}</div>
                      <div className="text-xs text-muted-foreground">Total Scan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{validItemsCount}</div>
                      <div className="text-xs text-muted-foreground">Valid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{receivedItems}</div>
                      <div className="text-xs text-muted-foreground">Sudah Diterima</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600">{totalOrderItems}</div>
                      <div className="text-xs text-muted-foreground">Total Order</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scanned Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Item yang Dipindai ({scannedItems.length})
                    </span>
                    {scannedItems.length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setScannedItems([])} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus Semua
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {scannedItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada item yang dipindai</p>
                      <p className="text-sm">Mulai scan atau input barcode/serial number</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] md:h-[500px]">
                      <div className="space-y-3">
                        {scannedItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                <Badge variant="outline" className="font-mono text-xs">
                                  {item.identifier}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {item.type}
                                </Badge>
                              </div>
                              {item.orderItem && (
                                <div className="ml-6">
                                  <p className="font-medium text-sm">{item.orderItem.product.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.orderItem.product.sku}</p>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground ml-6">{item.timestamp.toLocaleTimeString('id-ID')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(item.status)}
                              <Button variant="ghost" size="sm" onClick={() => removeScannedItem(item.id)} className="text-red-600 hover:text-red-700 p-1">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Ringkasan Penerimaan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Item Valid:</span>
                      <span className="font-medium text-green-600">{validItemsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tidak Valid:</span>
                      <span className="font-medium text-red-600">{scannedItems.filter((item) => item.status === 'not_found').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sudah Dipindai:</span>
                      <span className="font-medium text-blue-600">{scannedItems.filter((item) => item.status === 'already_scanned_session').length}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Progress:</span>
                      <span>{Math.round(((receivedItems + validItemsCount) / totalOrderItems) * 100)}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((receivedItems + validItemsCount) / totalOrderItems) * 100}%` }}></div>
                  </div>

                  <Button className="w-full" onClick={handleSubmit} disabled={validItemsCount === 0 || isProcessing}>
                    {isProcessing ? 'Memproses...' : `Terima ${validItemsCount} Tabung`}
                  </Button>
                </CardContent>
              </Card>

              {/* Order Items Reference */}
              <Card>
                <CardHeader>
                  <CardTitle>Item dalam Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {order.details.map((detail) => (
                        <div key={detail.id} className="p-3 border rounded-lg text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {detail.cylinder.barcode_id}
                            </Badge>
                            {detail.isReturned ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Diterima
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Pending</Badge>
                            )}
                          </div>
                          <p className="font-medium text-xs">{detail.product.name}</p>
                          <p className="text-xs text-muted-foreground">SN: {detail.cylinder.serial_number}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
