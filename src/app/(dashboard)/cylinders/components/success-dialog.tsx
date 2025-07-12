'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, PackagePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAnother: () => void;
  onFinish: () => void;
  barcode: string;
}

export function SuccessDialog({ open, onOpenChange, onAddAnother, onFinish, barcode }: SuccessDialogProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>
          <DialogTitle className="text-center">Tabung Berhasil Ditambahkan</DialogTitle>
          <DialogDescription className="text-center">
            Tabung gas dengan barcode <span className="font-mono font-semibold">{barcode}</span> telah berhasil ditambahkan ke sistem.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2 pt-4">
          <Button onClick={onAddAnother} className="w-full">
            <PackagePlus className="mr-2 h-4 w-4" />
            Tambah Tabung Lagi
          </Button>
          <Button onClick={onFinish} variant="outline" className="w-full">
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
