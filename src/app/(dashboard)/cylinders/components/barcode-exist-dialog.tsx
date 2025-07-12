'use client';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BarcodeExistsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode: string;
  isExisting: boolean;
}

export function BarcodeExistsDialog({ open, onOpenChange, barcode, isExisting }: BarcodeExistsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="flex justify-center mb-4">
            {isExisting ? (
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
          </motion.div>
          <DialogTitle className="text-center">{isExisting ? 'Barcode Sudah Terdaftar' : 'Barcode Tersedia'}</DialogTitle>
          <DialogDescription className="text-center">
            {isExisting ? (
              <>
                Barcode <span className="font-mono font-semibold">{barcode}</span> sudah terdaftar dalam sistem. Silakan gunakan barcode yang berbeda.
              </>
            ) : (
              <>
                Barcode <span className="font-mono font-semibold">{barcode}</span> tersedia dan dapat digunakan.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center pt-4">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Mengerti
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
