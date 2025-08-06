'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
  variant?: 'default' | 'destructive';
  details?: {
    customer?: string;
    warehouse?: string;
    fromCustomer?: string;
    toCustomer?: string;
    date?: string;
    itemCount?: number;
    items?: string[];
    notes?: string;
  };
}

export function ConfirmationDialog({ open, onOpenChange, title, description, confirmText, cancelText = 'Batal', onConfirm, variant = 'default', details }: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error during confirmation:', error);
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  const content = (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {details && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            {details.customer && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Customer:</span>
                <span className="text-sm">{details.customer}</span>
              </div>
            )}

            {details.fromCustomer && details.toCustomer && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Transfer:</span>
                <span className="text-sm">
                  {details.fromCustomer} → {details.toCustomer}
                </span>
              </div>
            )}

            {details.warehouse && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Warehouse:</span>
                <span className="text-sm">{details.warehouse}</span>
              </div>
            )}

            {details.date && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tanggal:</span>
                <span className="text-sm">{details.date}</span>
              </div>
            )}

            {details.itemCount && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Jumlah Item:</span>
                <Badge variant="secondary">{details.itemCount} item</Badge>
              </div>
            )}

            {details.items && details.items.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Items:</span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {details.items.slice(0, 5).map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {details.items.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{details.items.length - 5} lainnya
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {details.notes && (
              <div className="space-y-1">
                <span className="text-sm font-medium">Catatan:</span>
                <p className="text-sm text-muted-foreground bg-background p-2 rounded border">{details.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  const footer = (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onClick={handleConfirm} disabled={isLoading} className={variant === 'default' ? 'bg-green-600 hover:bg-green-700' : ''}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          confirmText
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="sr-only">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
