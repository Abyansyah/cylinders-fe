'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Calendar, Scan, AlertCircle, CheckCircle, Save, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/page-transition';
import { BarcodeScanner } from '@/components/features/barcode-scanner';
import type { PrepareOrderDetail, PrepareOrderItem } from '@/types/order';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { assignAllCylinders, markOrderAsPrepared, unassignAllCylinders, validateCylinderForOrderItem } from '@/services/orderService';
import { Textarea } from '@/components/ui/textarea';
import useSWR from 'swr';
import { getPrepareOrderDetails } from '@/services/orderService';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface ItemWithBarcode extends PrepareOrderItem {
  assignedBarcodes: string[];
}

interface PrepareOrderDetailClientProps {
  initialOrder: PrepareOrderDetail;
}

export default function PrepareOrderDetailClient({ initialOrder }: PrepareOrderDetailClientProps) {
  const router = useRouter();
  const { data: order, mutate } = useSWR(`/orders/warehouse/orders/${initialOrder.id}/prepare-details`, () => getPrepareOrderDetails(initialOrder.id), {
    fallbackData: initialOrder,
  });

  const [items, setItems] = useState<ItemWithBarcode[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [warehouseNotes, setWarehouseNotes] = useState('');
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const [isPrepareModalOpen, setPrepareModalOpen] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(
        order.items.map((item: PrepareOrderItem) => ({
          ...item,
          assignedBarcodes: item.assigned_barcodes || [],
          assigned_quantity: item.assigned_barcodes?.length || 0,
        }))
      );
    }
  }, []);

  const handleBarcodeInput = async (itemIndex: number, barcode: string) => {
    if (!barcode.trim()) return;

    const item = items[itemIndex];
    if (item.assignedBarcodes.length >= item.required_quantity) {
      toast.error('Jumlah barcode sudah mencukupi untuk item ini.');
      return;
    }
    if (item.assignedBarcodes.includes(barcode)) {
      toast.error('Barcode sudah digunakan untuk item ini.');
      return;
    }

    try {
      const validation: any = await validateCylinderForOrderItem(item.order_item_id, barcode);
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }

      setItems((prev) =>
        prev.map((currentItem, index) => {
          if (index === itemIndex) {
            const newBarcodes = [...currentItem.assignedBarcodes, validation?.cylinder?.barcode_id];
            return {
              ...currentItem,
              assignedBarcodes: newBarcodes,
              assigned_quantity: newBarcodes.length,
            };
          }
          return currentItem;
        })
      );
      toast.success(`Barcode ${barcode} berhasil divalidasi dan ditambahkan.`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memvalidasi barcode.');
    }
  };

  const handleScanBarcode = (itemIndex: number) => {
    setCurrentItemIndex(itemIndex);
    setScannerOpen(true);
  };

  const handleScanResult = (barcode: string) => {
    if (currentItemIndex !== null) {
      handleBarcodeInput(currentItemIndex, barcode);
    }
    setScannerOpen(false);
    setCurrentItemIndex(null);
  };

  const removeBarcodeFromItem = (itemIndex: number, barcodeIndex: number) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index === itemIndex) {
          const newBarcodes = item.assignedBarcodes.filter((_, i) => i !== barcodeIndex);
          return {
            ...item,
            assignedBarcodes: newBarcodes,
            assigned_quantity: newBarcodes.length,
          };
        }
        return item;
      })
    );
  };

  const allItemsComplete = useMemo(() => items.every((item) => item.assigned_quantity === item.required_quantity), [items]);
  const totalAssigned = useMemo(() => items.reduce((sum, item) => sum + item.assigned_quantity, 0), [items]);
  const totalRequired = useMemo(() => items.reduce((sum, item) => sum + item.required_quantity, 0), [items]);

  const handleAssignCylinders = async () => {
    setIsLoading(true);
    const assignments = items.map((item) => ({
      order_item_id: item.order_item_id,
      barcode_ids: item.assignedBarcodes,
    }));

    try {
      await assignAllCylinders(order.id, { assignments, notes_petugas_gudang: warehouseNotes });
      toast.success('Semua tabung berhasil disimpan!');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data tabung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPrepared = async () => {
    setIsLoading(true);
    try {
      await markOrderAsPrepared(order.id);
      toast.success('Order berhasil ditandai sebagai Siap Kirim!');
      router.push('/warehouse-prepare');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menandai order.');
    } finally {
      setIsLoading(false);
      setPrepareModalOpen(false);
    }
  };

  const handleResetCylinders = async () => {
    setIsLoading(true);
    try {
      await unassignAllCylinders(order.id);
      toast.success('Alokasi tabung berhasil diatur ulang.');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengatur ulang tabung.');
    } finally {
      setIsLoading(false);
      setResetModalOpen(false);
    }
  };

  if (!order) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order Tidak Ditemukan</h3>
          <p className="text-muted-foreground mb-4">Order tidak ditemukan atau tidak dalam status yang tepat untuk disiapkan.</p>
          <Button asChild>
            <Link href="/warehouse-prepare">Kembali ke Daftar Order</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/warehouse-prepare">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Menyiapkan Tabung</h1>
            <p className="text-muted-foreground">Scan atau input barcode untuk setiap tabung</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{order.order_number}</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{order.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{order.order_date}</p>
                    <p className="text-sm text-muted-foreground">Tipe: {order.order_type}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress Persiapan</span>
                <span className="text-sm text-muted-foreground">
                  {totalAssigned}/{totalRequired} tabung
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div className="bg-blue-600 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${(totalAssigned / totalRequired) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          {items.map((item, itemIndex) => (
            <motion.div key={item.order_item_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * itemIndex }}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{item.product_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku} • Dibutuhkan: {item.required_quantity} tabung
                      </p>
                    </div>
                    <Badge className={item.assigned_quantity === item.required_quantity ? 'bg-green-100 text-green-800' : item.assigned_quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}>
                      {item.assigned_quantity}/{item.required_quantity}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {order.status !== 'Disiapkan Gudang' && (
                      <>
                        <Label>Input Barcode Tabung</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Scan atau ketik barcode..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                handleBarcodeInput(itemIndex, input.value);
                                input.value = '';
                              }
                            }}
                            disabled={item.assigned_quantity >= item.required_quantity}
                          />
                          <Button variant="outline" size="icon" onClick={() => handleScanBarcode(itemIndex)} disabled={item.assigned_quantity >= item.required_quantity}>
                            <Scan className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}

                    {item.assignedBarcodes.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Barcode yang Sudah Ditambahkan:</Label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {item.assignedBarcodes.map((barcode, barcodeIndex) => (
                            <div key={barcodeIndex} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-mono">{barcode}</span>
                              </div>
                              {order.status !== 'Disiapkan Gudang' && (
                                <Button variant="ghost" size="sm" onClick={() => removeBarcodeFromItem(itemIndex, barcodeIndex)} className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                                  ×
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * items.length }}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Catatan Petugas Gudang</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Tambahkan catatan untuk pengiriman..." value={warehouseNotes} onChange={(e) => setWarehouseNotes(e.target.value)} disabled={order.status === 'Disiapkan Gudang'} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg">
          <div className="max-w-md mx-auto flex gap-2">
            {order.status === 'Disiapkan Gudang' ? (
              <>
                <Button onClick={() => setResetModalOpen(true)} disabled={isLoading} variant="outline" className="flex-1 h-12 text-base font-semibold">
                  <RotateCcw className="mr-2 h-5 w-5" /> Atur Ulang Tabung
                </Button>
                <Button onClick={() => setPrepareModalOpen(true)} disabled={isLoading} className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700">
                  {isLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" /> Siap Kirim
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleAssignCylinders} disabled={isLoading || !allItemsComplete} className="w-full h-12 text-base font-semibold">
                {isLoading ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Simpan Tabung Gas ({totalAssigned}/{totalRequired})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {scannerOpen && (
          <BarcodeScanner
            onClose={() => {
              setScannerOpen(false);
              setCurrentItemIndex(null);
            }}
            onScan={handleScanResult}
          />
        )}

        <ConfirmationDialog
          open={isResetModalOpen}
          onOpenChange={setResetModalOpen}
          title="Atur Ulang Alokasi Tabung?"
          description="Aksi ini akan menghapus semua barcode yang sudah dialokasikan untuk order ini. Anda perlu melakukan scan ulang. Lanjutkan?"
          onConfirm={handleResetCylinders}
          variant="destructive"
          confirmText="Ya, Atur Ulang"
          cancelText="Batal"
          isLoading={isLoading}
        />

        <ConfirmationDialog
          open={isPrepareModalOpen}
          onOpenChange={setPrepareModalOpen}
          title="Konfirmasi Siap Kirim"
          description="Apakah Anda yakin ingin menandai order ini sebagai 'Siap Kirim'? Status tidak dapat diubah setelahnya."
          onConfirm={handleMarkAsPrepared}
          variant="default"
          confirmText="Ya, Siap Kirim"
          cancelText="Batal"
          isLoading={isLoading}
        />
      </div>
    </PageTransition>
  );
}
