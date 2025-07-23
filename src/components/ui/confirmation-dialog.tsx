'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
}

export function ConfirmationDialog({ open, onOpenChange, title, description, onConfirm, isLoading = false, variant = 'default', confirmText = 'Confirm', cancelText = 'Cancel', icon }: ConfirmationDialogProps) {
  const isMobile = useIsMobile();

  const IconComponent = icon || (variant === 'destructive' ? AlertTriangle : CheckCircle);
  const iconColor = variant === 'destructive' ? 'text-red-600' : 'text-green-600';
  const bgColor = variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30';
  const buttonVariant = variant === 'destructive' ? 'destructive' : 'default';

  const content = (
    <div className="space-y-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }} className="flex justify-center">
        <div className={`h-16 w-16 rounded-full ${bgColor} flex items-center justify-center`}>
          <IconComponent className={`h-8 w-8 ${iconColor}`} />
        </div>
      </motion.div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2 gap-2 pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} disabled={isLoading} variant={buttonVariant} className="w-full sm:w-auto">
          {isLoading ? 'Loading...' : confirmText}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-4 pb-6">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="text-lg font-semibold text-center"/>
      <DialogContent className="sm:max-w-md">{content}</DialogContent>
    </Dialog>
  );
}
