'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Scan, Check, AlertTriangle, X, Trash2, CheckCircle, Package, ClipboardList } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PageTransition } from '@/components/page-transition';
import type { ScannedItem, AuditScanData } from '@/types/customer-audit';
import { toast } from 'sonner';
import { getAuditForScan, scanAuditBarcode, deleteScannedItem } from '@/services/auditService';
import useSWR from 'swr';
import { BarcodeScanner } from '@/components/features/barcode-scanner';

const FINDING_STATUS_CONFIG = {
  MATCH: { label: 'Match', color: 'border-green-200 bg-green-50' },
  UNEXPECTED: { label: 'Unexpected', color: 'border-orange-200 bg-orange-50' },
  FOREIGN: { label: 'Foreign', color: 'border-purple-200 bg-purple-50' },
  MISSING: { label: 'Missing', color: 'border-red-200 bg-red-50' },
};

export default function AuditScanView({ initialAuditData }: { initialAuditData: AuditScanData }) {
  const router = useRouter();
  const params = useParams();
  const auditId = Number(params.id);

  const { data: auditData, mutate } = useSWR(`/audits/${auditId}`, () => getAuditForScan(auditId), {
    fallbackData: initialAuditData,
  });

  const [manualBarcode, setManualBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsLoading(true);

    try {
      await scanAuditBarcode(auditId, { scan_input: barcode });
      mutate();
      toast.success('Berhasil Scan', {
        description: `Barcode ${barcode} berhasil discan`,
      });
      setManualBarcode('');
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Gagal melakukan scan. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScan = async (detailId: number) => {
    try {
      await deleteScannedItem(auditId, detailId);
      mutate();
      toast.success('Berhasil Dihapus', {
        description: 'Item scan berhasil dihapus',
      });
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Gagal menghapus item scan',
      });
    }
  };

  const handleCompleteAudit = () => {
    router.push(`/customer-audit/${auditId}/complete`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MATCH':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'UNEXPECTED':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'FOREIGN':
        return <X className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const progress = {
    expected: auditData?.expected_cylinders.length || 0,
    scanned: auditData?.scanned_items.filter((s) => s.finding_status === 'MATCH').length || 0,
    unexpected: auditData?.scanned_items.filter((s) => s.finding_status === 'UNEXPECTED').length || 0,
    foreign: auditData?.scanned_items.filter((s) => s.finding_status === 'FOREIGN').length || 0,
  };

  if (!auditData) return <div>Loading...</div>;

  return (
    <PageTransition>
      <div className="flex-1 space-y-4 pt-2 md:pt-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{auditData.audit_details.audit_number}</h1>
              <p className="text-sm text-muted-foreground">
                {auditData.audit_details.customer.customer_name} - {auditData.audit_details.branch.name}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{progress.expected}</div>
                  <div className="text-xs text-muted-foreground">Expected</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{progress.scanned}</div>
                  <div className="text-xs text-muted-foreground">Matched</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{progress.unexpected}</div>
                  <div className="text-xs text-muted-foreground">Unexpected</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <X className="h-4 w-4 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{progress.foreign}</div>
                  <div className="text-xs text-muted-foreground">Foreign</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Scan Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Masukkan barcode atau nomor tabung manual..."
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleScan(manualBarcode);
                        }
                      }}
                    />
                  </div>
                  <Button onClick={() => handleScan(manualBarcode)} disabled={isLoading || !manualBarcode.trim()}>
                    {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : 'Scan'}
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setIsScannerOpen(true)} className="w-full bg-transparent">
                  <Camera className="mr-2 h-4 w-4" />
                  Scan dengan Kamera
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="scanned" className="w-full">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scanned">Scanned Items ({auditData.scanned_items.length})</TabsTrigger>
                    <TabsTrigger value="expected">Expected Items ({auditData.expected_cylinders.length})</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="scanned" className="p-6 pt-4">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {auditData.scanned_items.map((item) => (
                        <motion.div
                          key={item.detail_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`rounded-lg border ${FINDING_STATUS_CONFIG[item.finding_status as keyof typeof FINDING_STATUS_CONFIG].color}`}
                        >
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {getStatusIcon(item.finding_status)}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{item.scanned_barcode}</div>
                                <div className="text-sm text-muted-foreground truncate">{item.cylinder_details?.serial_number || 'No details'}</div>
                              </div>
                              <Badge variant="outline" className="shrink-0 ml-2">
                                {FINDING_STATUS_CONFIG[item.finding_status as keyof typeof FINDING_STATUS_CONFIG].label}
                              </Badge>
                            </div>
                          </div>
                          <div className="border-t bg-gray-50/50 px-4 py-3">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus Item
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Item Scan</AlertDialogTitle>
                                  <AlertDialogDescription>Apakah Anda yakin ingin menghapus scan untuk barcode {item.scanned_barcode}?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteScan(item.detail_id)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {auditData.scanned_items.length === 0 && <div className="text-center py-8 text-muted-foreground">Belum ada item yang discan</div>}
                  </div>
                </TabsContent>
                <TabsContent value="expected" className="p-6 pt-4">
                  <div className="space-y-3">
                    {auditData.expected_cylinders.map((cylinder) => {
                      const isScanned = auditData.scanned_items.some((s) => s.scanned_barcode === cylinder.barcode_id && s.finding_status === 'MATCH');
                      return (
                        <div key={cylinder.id} className={`flex items-center justify-between p-4 rounded-lg border ${isScanned ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center space-x-3">
                            {isScanned ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Package className="h-5 w-5 text-gray-400" />}
                            <div>
                              <div className="font-medium">{cylinder.barcode_id}</div>
                              <div className="text-sm text-muted-foreground">{cylinder.serial_number}</div>
                            </div>
                          </div>
                          {isScanned && <Badge className="bg-green-100 text-green-800">Scanned</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="sticky bottom-4">
          <Button onClick={handleCompleteAudit} className="w-full" size="lg" disabled={auditData.scanned_items.length === 0}>
            <ClipboardList className="mr-2 h-5 w-5" />
            Selesaikan Audit
          </Button>
        </motion.div>
      </div>
      {isScannerOpen && <BarcodeScanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />}
    </PageTransition>
  );
}
