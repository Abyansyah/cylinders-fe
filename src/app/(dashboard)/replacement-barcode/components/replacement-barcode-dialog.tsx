'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Package, QrCode, Loader2 } from 'lucide-react';
import type { CylinderForReplacement } from '@/types/replacement-barcode';

interface ReplacementBarcodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cylinder: CylinderForReplacement | null;
  newBarcode: string;
  serialNumberConfirmation: string;
  onConfirm: () => Promise<void>;
}

export function ReplacementBarcodeDialog({ open, onOpenChange, cylinder, newBarcode, serialNumberConfirmation, onConfirm }: ReplacementBarcodeDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error during barcode replacement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const content = (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Konfirmasi Penggantian Barcode</h3>
          <p className="text-sm text-muted-foreground">Pastikan data yang akan diganti sudah benar</p>
        </div>
      </div>

      {cylinder && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Informasi Tabung Saat Ini
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Serial Number:</span>
                <p className="font-medium">{cylinder.serial_number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Barcode Lama:</span>
                <p className="font-medium font-mono">{cylinder.barcode_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Jenis Tabung:</span>
                <p className="font-medium">{cylinder.cylinderProperty.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Jenis Gas:</span>
                <p className="font-medium">{cylinder.gasType?.name || 'Tidak ada'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg border bg-green-50 p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Data Penggantian Baru
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Barcode Baru:</span>
                <p className="font-medium font-mono text-green-700">{newBarcode}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Konfirmasi Serial Number:</span>
                <p className="font-medium">{serialNumberConfirmation}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Peringatan:</strong> Setelah barcode diganti, barcode lama tidak dapat digunakan lagi. Pastikan semua data sudah benar sebelum melanjutkan.
            </p>
          </div>
        </div>
      )}
    </>
  );

  const footer = (
    <div className="flex gap-3 justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
        Batal
      </Button>
      <Button onClick={handleConfirm} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          'Ya, Ganti Barcode'
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>Konfirmasi Penggantian Barcode</DrawerTitle>
            <DrawerDescription>Pastikan data yang akan diganti sudah benar</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">{content}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Konfirmasi Penggantian Barcode</DialogTitle>
          <DialogDescription>Pastikan data yang akan diganti sudah benar</DialogDescription>
        </DialogHeader>
        <div className="py-4">{content}</div>
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
