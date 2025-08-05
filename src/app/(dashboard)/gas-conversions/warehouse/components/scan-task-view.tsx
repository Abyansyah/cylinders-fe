'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Scan, Trash2, ArrowRight, Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/gas-conversion';
import type { GasConversion, BarcodeSubmission } from '@/types/gas-conversion';
import { getGasConversionById, executeGasConversion } from '@/services/gasConversionService';
import useSWR from 'swr';
import { toast } from 'sonner';
import { BarcodeScanner } from '@/components/features/barcode-scanner';

export default function ScanTaskView({ initialTask }: { initialTask: GasConversion }) {
  const router = useRouter();
  const params = useParams();
  const taskId = Number.parseInt(params.id as string);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: task, isLoading: isLoadingTask } = useSWR(`/gas-conversions/${taskId}`, () => getGasConversionById(taskId), {
    fallbackData: initialTask,
  });

  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (isLoadingTask) return <div>Loading...</div>;

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tugas tidak ditemukan</h3>
          <p className="text-muted-foreground mb-4">Tugas yang Anda cari tidak dapat ditemukan.</p>
          <Button asChild>
            <Link href="/gas-conversions/warehouse">Kembali ke Tugas Gudang</Link>
          </Button>
        </div>
      </div>
    );
  }

  const remainingQuantity = task.quantity - task.fulfilled_quantity - scannedBarcodes.length;

  const addBarcode = (barcode: string) => {
    if (barcode.trim() && !scannedBarcodes.includes(barcode.trim()) && remainingQuantity > 0) {
      setScannedBarcodes((prev) => [...prev, barcode.trim()]);
      setBarcodeInput('');
      inputRef.current?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBarcode(barcodeInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBarcode(barcodeInput);
    }
  };

  const removeBarcodeItem = (barcode: string) => {
    setScannedBarcodes((prev) => prev.filter((b) => b !== barcode));
  };

  const handleSubmitBarcodes = async () => {
    if (scannedBarcodes.length === 0) return;

    setIsSubmitting(true);
    try {
      const submission: BarcodeSubmission = {
        barcodes: scannedBarcodes,
      };
      await executeGasConversion(taskId, submission);
      toast.success('Barcode berhasil disimpan!');
      router.push('/gas-conversions/warehouse');
    } catch (error: any) {
      toast.error('Gagal menyimpan barcode', {
        description: error.response?.data?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (task.fulfilled_quantity / task.quantity) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/gas-conversions/warehouse">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scan Tabung - {task.request_number}</h1>
          <p className="text-muted-foreground">Scan barcode tabung untuk proses alih fungsi gas</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tugas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Konversi</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">{task.fromProduct.name}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{task.toProduct.name}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
              <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Progress</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Selesai: {task.fulfilled_quantity}</span>
                  <span>Sisa: {task.quantity - task.fulfilled_quantity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Jenis Kemasan</h4>
              <p className="text-sm">{task.packaging_type}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Barcode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode Tabung</Label>
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    id="barcode"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik barcode..."
                    className="flex-1"
                    autoFocus
                    disabled={remainingQuantity <= 0}
                  />
                  <Button type="submit" size="icon" disabled={!barcodeInput.trim() || remainingQuantity <= 0}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)} disabled={remainingQuantity <= 0}>
                    <Scan className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            <div className="text-sm text-muted-foreground">
              <p>• Scan barcode atau ketik manual</p>
              <p>• Tekan Enter atau tombol + untuk menambahkan</p>
              <p>• Total yang diperlukan: {remainingQuantity} tabung</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Barcode yang Telah Discan ({scannedBarcodes.length})</CardTitle>
            {scannedBarcodes.length > 0 && (
              <Button onClick={handleSubmitBarcodes} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? 'Menyimpan...' : `Simpan ${scannedBarcodes.length} Barcode`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {scannedBarcodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada barcode yang discan</p>
              <p className="text-sm">Mulai scan barcode tabung untuk melanjutkan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scannedBarcodes.map((barcode, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">{index + 1}</div>
                    <span className="font-mono text-sm">{barcode}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeBarcodeItem(barcode)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isScannerOpen && (
        <BarcodeScanner
          onScan={(scannedBarcode) => {
            addBarcode(scannedBarcode);
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}
