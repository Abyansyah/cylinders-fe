'use client';

import { useState } from 'react';
import { Package, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import type { WarehouseReceiptItem } from '@/types/warehouse-receipt';
import { receiveTTBK } from '@/services/ttbkService';
import { toast } from 'sonner';

interface WarehouseReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WarehouseReceiptItem | null;
  onConfirm: (itemId: number, notes: string) => void;
}

export function WarehouseReceiptDialog({ open, onOpenChange, item, onConfirm }: WarehouseReceiptDialogProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useIsMobile();

  const handleConfirm = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      await receiveTTBK(item.id, { notes });
      onConfirm(item.id, notes);
      setNotes('');
      onOpenChange(false);
      toast.success('TTBK berhasil diterima');
    } catch (error: any) {
      toast.error('Gagal menerima TTBK', {
        description: error.response?.data?.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNotes('');
    onOpenChange(false);
  };

  if (!item) return null;

  if (!isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Konfirmasi Penerimaan Tabung
            </DialogTitle>
            <DialogDescription>Pastikan semua tabung telah diterima dengan kondisi yang sesuai sebelum melanjutkan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-lg">{item.ttbk_number}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{item.customer.customer_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Driver:</span>
                  <p className="font-medium">{item.driver.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Jumlah Tabung:</span>
                  <p className="font-semibold text-blue-600">{item.cylinder_count}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tanggal:</span>
                  <p className="font-medium">{new Date(item.receipt_date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {item.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground text-sm">Catatan Awal:</span>
                    <p className="text-sm mt-1">{item.notes}</p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Catatan Penerimaan
              </Label>
              <Textarea id="receipt-notes" placeholder="Tambahkan catatan kondisi tabung yang diterima (opsional)..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="resize-none" />
              <p className="text-xs text-muted-foreground">Catatan ini akan disimpan sebagai dokumentasi penerimaan tabung.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Batal
            </Button>
            <Button onClick={handleConfirm} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Terima Tabung
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Konfirmasi Penerimaan Tabung
          </DrawerTitle>
          <DrawerDescription>Pastikan semua tabung telah diterima dengan kondisi yang sesuai sebelum melanjutkan.</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-lg">{item.ttbk_number}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{item.customer.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver:</span>
                <span className="font-medium">{item.driver.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Tabung:</span>
                <span className="font-semibold text-blue-600">{item.cylinder_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal:</span>
                <span className="font-medium">{new Date(item.receipt_date).toLocaleDateString('id-ID')}</span>
              </div>
            </div>

            {item.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground text-sm">Catatan Awal:</span>
                  <p className="text-sm mt-1">{item.notes}</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt-notes-mobile" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Catatan Penerimaan
            </Label>
            <Textarea id="receipt-notes-mobile" placeholder="Tambahkan catatan kondisi tabung yang diterima (opsional)..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="resize-none" />
            <p className="text-xs text-muted-foreground">Catatan ini akan disimpan sebagai dokumentasi penerimaan tabung.</p>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleConfirm} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Terima Tabung
              </>
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Batal
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
