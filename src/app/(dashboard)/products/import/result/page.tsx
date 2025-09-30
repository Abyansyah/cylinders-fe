'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { ImportResult } from '@/types/customer-import';
import { IMPORT_RESULT_EXPIRY_HOURS, IMPORT_RESULT_STORAGE_KEY } from '@/constants/product-imports';

export default function ImportResultPage() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadImportResult = () => {
      try {
        const stored = localStorage.getItem(IMPORT_RESULT_STORAGE_KEY);
        if (!stored) {
          router.push('/products/import');
          return;
        }

        const result: ImportResult = JSON.parse(stored);
        const now = Date.now();
        const expiryTime = result.timestamp + IMPORT_RESULT_EXPIRY_HOURS * 60 * 60 * 1000;

        if (now > expiryTime) {
          localStorage.removeItem(IMPORT_RESULT_STORAGE_KEY);
          toast.error('Hasil impor telah kedaluwarsa. Silakan lakukan impor ulang.');
          router.push('/products/import');
          return;
        }

        setImportResult(result);
      } catch (error) {
        console.error('Error loading import result:', error);
        router.push('/products/import');
      } finally {
        setIsLoading(false);
      }
    };

    loadImportResult();
  }, [router]);

  const handleRetryImport = () => {
    localStorage.removeItem(IMPORT_RESULT_STORAGE_KEY);
    router.push('/products/import');
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!importResult) {
    return null;
  }

  const { response } = importResult;
  const hasErrors = response.failed_rows.length > 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/products/import')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Hasil Import Customer</h2>
        <p className="text-muted-foreground">Detail hasil proses import data customer</p>
      </div>

      <Alert className={hasErrors ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
        <AlertCircle className={`h-4 w-4 ${hasErrors ? 'text-red-600' : 'text-green-600'}`} />
        <AlertTitle className={hasErrors ? 'text-red-800' : 'text-green-800'}>{response.status}</AlertTitle>
        <AlertDescription className={hasErrors ? 'text-red-700' : 'text-green-700'}>{response.message}</AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Baris</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{response.summary.total_rows}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berhasil Diimpor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{response.summary.successfully_imported}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gagal Diimpor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{response.summary.failed_imports}</div>
          </CardContent>
        </Card>
      </div>

      {hasErrors && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data yang Gagal Diimpor</CardTitle>
                <CardDescription>Berikut adalah data yang gagal diimpor beserta alasan kegagalannya</CardDescription>
              </div>
              <Button size="sm" onClick={handleRetryImport}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Import Ulang
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Baris</TableHead>
                    <TableHead>Nama Customer</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {response.failed_rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <Badge variant="destructive">{row.row_number}</Badge>
                      </TableCell>
                      <TableCell>{row.data.customer_name}</TableCell>
                      <TableCell className="text-red-600 text-sm">{row.error}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
