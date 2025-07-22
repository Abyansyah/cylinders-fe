'use client';

import type React from 'react';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  orderNumber: string;
  isLoading?: boolean;
}

export function CancelOrderModal({ isOpen, onClose, onConfirm, orderNumber, isLoading = false }: CancelOrderModalProps) {
  const [notes, setNotes] = useState('');
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim()) {
      onConfirm(notes.trim());
    }
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warning Section */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h4 className="font-semibold text-red-800 dark:text-red-300">Peringatan!</h4>
          <p className="text-sm text-red-700 dark:text-red-400">Order yang dibatalkan tidak dapat dikembalikan. Pastikan keputusan Anda sudah tepat.</p>
        </div>
      </motion.div>

      {/* Order Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Number:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{orderNumber}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="cancel-notes" className="text-sm font-semibold">
          Alasan Pembatalan *
        </Label>
        <Textarea id="cancel-notes" placeholder="Jelaskan alasan pembatalan order ini..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="resize-none text-sm" required />
        <p className="text-xs text-gray-500">Catatan ini akan disimpan dalam riwayat order dan tidak dapat diubah.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1 bg-transparent">
          Batal
        </Button>
        <Button type="submit" variant="destructive" disabled={!notes.trim() || isLoading} className="flex-1">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Membatalkan...
            </>
          ) : (
            'Batalkan Order'
          )}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Batalkan Order
            </DrawerTitle>
            <DrawerDescription>Anda yakin ingin membatalkan order {orderNumber}?</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Batalkan Order
          </DialogTitle>
          <DialogDescription>Anda yakin ingin membatalkan order {orderNumber}?</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
