'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle, BarChart3, X } from 'lucide-react';
import { CylinderStatusUpdateResponse } from '@/types/cylinder-status-update';
import { useIsMobile } from '@/hooks/use-mobile';

interface UpdateResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: CylinderStatusUpdateResponse | null;
}

export function UpdateResultsDialog({ isOpen, onClose, results }: UpdateResultsDialogProps) {
  const isMobile = useIsMobile();

  if (!results) return null;

  const content = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Hasil Update Status</h3>
        </div>
        <p className="text-sm text-muted-foreground">{results.message}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{results.summary.total_requested}</div>
            <div className="text-xs text-muted-foreground">Total Diminta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{results.summary.successfully_updated}</div>
            <div className="text-xs text-muted-foreground">Berhasil</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{results.summary.skipped_no_change}</div>
            <div className="text-xs text-muted-foreground">Dilewati</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{results.summary.failed_validation}</div>
            <div className="text-xs text-muted-foreground">Gagal</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {results.updated_items && results.updated_items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                Berhasil Diupdate ({results.updated_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {results.updated_items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                      <span className="font-mono">{item.barcode_id}</span>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        {item.old_status} → {item.new_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        {results.skipped_items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                Dilewati ({results.skipped_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {results.skipped_items.map((item, index) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded text-sm space-y-1">
                      <div className="font-mono font-medium">{item.barcode_id}</div>
                      <div className="text-yellow-700 text-xs">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
        {results.failed_items.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                Gagal ({results.failed_items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {results.failed_items.map((item, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded text-sm space-y-1">
                      <div className="font-mono font-medium">{item.barcode_id}</div>
                      <div className="text-red-700 text-xs">{item.reason}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle>Hasil Update Status</DrawerTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <ScrollArea className="h-[calc(90vh-120px)]">{content}</ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Hasil Update Status</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">{content}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
