'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Building2, PenTool, Maximize2, X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/page-transition';
import type { CompleteAuditData, AuditScanData } from '@/types/customer-audit';
import { toast } from 'sonner';
import { completeAudit } from '@/services/auditService';
import { useIsMobile } from '@/hooks/use-mobile';
import SignatureCanvas from '@/components/signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CompleteAuditForm({ auditData }: { auditData: AuditScanData }) {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreenSignature, setIsFullscreenSignature] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 200 });
  const isMobile = useIsMobile();
  const [signatureData, setSignatureData] = useState({ base64: '', svg: '' });

  const [formData, setFormData] = useState<Omit<CompleteAuditData, 'pic_signature'>>({
    pic_name: '',
    pic_division: '',
  });

  const auditId = Number(params.id);

  const handleSignatureChange = (base64: string, svg: string) => {
    setSignatureData({ base64, svg });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pic_name || !formData.pic_division) {
      toast.error('Error', {
        description: 'Semua field harus diisi',
      });
      return;
    }

    setIsLoading(true);

    try {
      const completeData: CompleteAuditData = {
        ...formData,
        pic_signature: signatureData.base64,
      };

      await completeAudit(auditId, completeData);

      toast.success('Berhasil', {
        description: 'Audit berhasil diselesaikan!',
      });

      router.push('/customer-audit');
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Gagal menyelesaikan audit. Silakan coba lagi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 32; // Account for padding
        const height = Math.min(200, width * 0.33);
        setCanvasSize({ width: Math.max(300, width), height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <PageTransition>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Selesaikan Audit</h1>
              <p className="text-muted-foreground">
                {auditData.audit_details.audit_number} - {auditData.audit_details.customer.customer_name}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Form Penyelesaian
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pic_name">Nama PIC *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="pic_name" placeholder="Masukkan nama PIC" value={formData.pic_name} onChange={(e) => setFormData((prev) => ({ ...prev, pic_name: e.target.value }))} className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pic_divisi">Divisi PIC *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="pic_divisi" placeholder="Masukkan divisi PIC" value={formData.pic_division} onChange={(e) => setFormData((prev) => ({ ...prev, pic_division: e.target.value }))} className="pl-10" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Tanda Tangan Digital *</Label>
                    {isMobile && (
                      <Dialog open={isFullscreenSignature} onOpenChange={setIsFullscreenSignature}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            <Maximize2 className="h-4 w-4 mr-2" />
                            {signatureData.base64 ? 'Edit Tanda Tangan' : 'Buat Tanda Tangan'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
                          <DialogHeader>
                            <div className="flex items-center justify-between">
                              <DialogTitle>Tanda Tangan Digital</DialogTitle>
                              <Button variant="ghost" size="sm" onClick={() => setIsFullscreenSignature(false)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </DialogHeader>
                          <div className="mt-4">
                            <SignatureCanvas onSignatureChange={handleSignatureChange} width={800} height={400} isFullscreen={true} />
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button onClick={() => setIsFullscreenSignature(false)}>Selesai</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-white" ref={containerRef}>
                    {!isMobile ? (
                      <SignatureCanvas onSignatureChange={handleSignatureChange} width={canvasSize.width} height={canvasSize.height} isFullscreen={false} />
                    ) : (
                      <>
                        {!signatureData.base64 ? (
                          <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3">
                            <PenTool className="h-12 w-12 text-muted-foreground" />
                            <div>
                              <p className="text-muted-foreground font-medium">Belum ada tanda tangan</p>
                              <p className="text-sm text-muted-foreground">Gunakan tombol Fullscreen untuk menandatangani</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Preview Tanda Tangan:</Label>
                              <Button type="button" variant="outline" size="sm" onClick={() => setSignatureData({ base64: '', svg: '' })}>
                                Hapus
                              </Button>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                              <img src={signatureData.base64} alt="Preview Tanda Tangan" className="w-full h-auto max-h-32 object-contain" />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Signature Status Indicator */}
                  {signatureData.base64 && <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">✓ Tanda tangan telah dibuat</div>}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Kembali
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Menyimpan...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Selesaikan Audit
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
