'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Package, User, Truck, Calendar, FileText, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WarehouseReceiptDialog } from './warehouse-receipt-dialog';
import type { WarehouseReceiptItem, ReceiptNotes } from '@/types/warehouse-receipt';
import useSWR from 'swr';
import { getIncomingTTBKs } from '@/services/ttbkService';
import { motion } from 'framer-motion';

export default function WarehouseReceiptList() {
  const [receivedItems, setReceivedItems] = useState<ReceiptNotes[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WarehouseReceiptItem | null>(null);

  const { data: ttbkResponse, error, isLoading, mutate } = useSWR('/return-receipts/warehouse/incoming-ttbks', getIncomingTTBKs);
  const ttbkList = ttbkResponse?.data || [];

  const handleOpenDialog = (item: WarehouseReceiptItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleReceiveItem = (itemId: number, notes: string) => {
    setReceivedItems((prev) => [...prev, { itemId, notes }]);
    mutate();
  };

  const isReceived = (itemId: number) => receivedItems.some((item) => item.itemId === itemId);

  const getReceivedNotes = (itemId: number) => {
    return receivedItems.find((item) => item.itemId === itemId)?.notes || '';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Penerimaan Tabung</h2>
            <p className="text-muted-foreground">Kelola penerimaan tabung yang kembali ke gudang dari customer</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ttbkList.map((item: WarehouseReceiptItem) => (
            <Card key={item.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    {item.ttbk_number}
                  </CardTitle>
                  <Badge variant={isReceived(item.id) ? 'secondary' : 'default'} className={isReceived(item.id) ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}>
                    {isReceived(item.id) ? 'Diterima' : item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Customer:</span>
                    <span>{item.customer.customer_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Driver:</span>
                    <span>{item.driver.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Jumlah Tabung:</span>
                    <span className="font-semibold text-blue-600">{item.cylinder_count}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tanggal:</span>
                    <span>{format(new Date(item.receipt_date), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                </div>

                {item.notes && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Catatan Awal:</span>
                        <p className="text-muted-foreground mt-1">{item.notes}</p>
                      </div>
                    </div>
                  </>
                )}

                {isReceived(item.id) && getReceivedNotes(item.id) && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <span className="font-medium text-green-600">Catatan Penerimaan:</span>
                        <p className="text-muted-foreground mt-1">{getReceivedNotes(item.id)}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <Button onClick={() => handleOpenDialog(item)} disabled={isReceived(item.id)} className={`w-full ${isReceived(item.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isReceived(item.id) ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Sudah Diterima
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Terima Tabung
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {ttbkList.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada tabung untuk diterima</h3>
              <p className="text-muted-foreground text-center">Saat ini tidak ada tabung yang perlu diterima di gudang.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <WarehouseReceiptDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} onConfirm={handleReceiveItem} />
    </>
  );
}
