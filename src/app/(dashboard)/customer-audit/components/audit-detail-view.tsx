'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Building2, Calendar, CheckCircle, XCircle, AlertTriangle, HelpCircle, Download, Eye, Package, Maximize2, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/page-transition';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getAuditById } from '@/services/auditService';
import { CustomerAuditDetail } from '@/types/customer-audit';
import useSWR from 'swr';
import Image from 'next/image';
import AuditDetailTabs from './tabs-audit';
import { ExportAuditReport } from './export-audit-report';

export default function AuditDetailView({ initialAuditData }: { initialAuditData: CustomerAuditDetail }) {
  const router = useRouter();
  const params = useParams();
  const auditId = params.id as string;
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);

  const { data: auditData, isLoading } = useSWR(`/audits/${auditId}/results`, () => getAuditById(Number(auditId)), {
    fallbackData: initialAuditData,
  });

  const handleExportReport = () => {
    toast.info('Export Started', {
      description: 'Laporan audit sedang diunduh...',
    });
  };

  if (isLoading || !auditData) {
    return (
      <PageTransition>
        <div className="flex-1 space-y-6 p-4 md:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Audit</h1>
                <p className="text-muted-foreground">{auditData.audit_details.audit_number}</p>
              </div>
            </div>
            <div className="hidden md:flex">
              <ExportAuditReport auditId={auditData.audit_details.id} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Informasi Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Customer
                  </div>
                  <p className="font-medium">{auditData.audit_details.customer.customer_name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    Cabang
                  </div>
                  <p className="font-medium">{auditData.audit_details.branch.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Auditor
                  </div>
                  <p className="font-medium">{auditData.audit_details.auditor.name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Status
                  </div>
                  <p className="font-medium">{auditData.audit_details.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Match</p>
                    <p className="text-2xl font-bold text-green-600">{auditData.summary.match}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Missing</p>
                    <p className="text-2xl font-bold text-red-600">{auditData.summary.missing}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unexpected</p>
                    <p className="text-2xl font-bold text-orange-600">{auditData.summary.unexpected}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Foreign</p>
                    <p className="text-2xl font-bold text-purple-600">{auditData.summary.foreign}</p>
                  </div>
                  <HelpCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi PIC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nama PIC</p>
                  <p className="font-medium">{auditData.audit_details.pic_name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Divisi</p>
                  <p className="font-medium">{auditData.audit_details.pic_division}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Tanda Tangan</p>
                    <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] max-h-[90vh] p-6">
                        <DialogHeader>
                          <div className="flex items-center justify-between">
                            <DialogTitle>Tanda Tangan Digital</DialogTitle>
                          </div>
                        </DialogHeader>
                        <div className="mt-4">
                          <div className="border rounded-lg p-6 bg-gray-50">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="relative w-full max-w-2xl">
                                <Image src={auditData.audit_details.pic_signature_url} width={800} height={200} alt="Tanda tangan digital" className="w-full h-auto border border-gray-200 rounded bg-white p-4" />
                              </div>
                              <div className="text-center space-y-2">
                                <p className="font-medium text-lg">{auditData.audit_details.pic_name}</p>
                                <p className="text-sm text-muted-foreground">{auditData.audit_details.pic_division}</p>
                                <p className="text-xs text-muted-foreground">Tanda tangan digital terverifikasi</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button onClick={() => setIsSignatureDialogOpen(false)}>Tutup</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="relative aspect-[5/1] max-w-[300px] mx-auto">
                      <Image src={auditData.audit_details.pic_signature_url} fill alt="Tanda tangan" className="object-contain" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">Klik "Lihat Detail" untuk ukuran penuh</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <AuditDetailTabs summary={auditData.summary} results={auditData.results} />
        </motion.div>

        <div className="md:hidden">
          <ExportAuditReport auditId={auditData.audit_details.id} />
        </div>
      </div>
    </PageTransition>
  );
}
