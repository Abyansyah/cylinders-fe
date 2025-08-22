'use client';

import type React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { IMPORT_RESULT_STORAGE_KEY } from '@/constants/cylinder-import';
import type { ImportResponse, ImportResult } from '@/types/cylinder-import';
import { importCylinders } from '@/services/cylinderService';
import Link from 'next/link';

export default function CylinderImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Harap pilih file Excel (.xlsx atau .xls).');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 10MB.');
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveImportResult = (response: ImportResponse) => {
    const result: ImportResult = {
      response,
      timestamp: Date.now(),
    };
    localStorage.setItem(IMPORT_RESULT_STORAGE_KEY, JSON.stringify(result));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Harap pilih file Excel terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response: any = await importCylinders(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      saveImportResult(response);

      if (response.failed_rows.length === 0) {
        toast.success('Data berhasil diimpor tanpa kesalahan.');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        router.push('/cylinders/import/result');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengimpor data. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Import Tabung</h2>
          <p className="text-muted-foreground">Import data tabung dari file Excel</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Data Tabung</CardTitle>
          <CardDescription>Klik tombol atau drag & drop file Excel untuk memulai proses import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragOver ? 'border-blue-500 bg-blue-50' : selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileInputChange} className="hidden" disabled={isUploading} />

              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-green-700">File Terpilih</h3>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={removeFile} disabled={isUploading} className="mt-2 bg-transparent">
                    <X className="mr-2 h-4 w-4" />
                    Hapus File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-blue-50 p-6">
                      <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Pilih File Excel</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">Klik tombol di bawah untuk memilih file atau drag & drop file Excel (.xlsx atau .xls) ke area ini</p>
                  </div>
                  <Button onClick={openFileDialog} disabled={isUploading}>
                    <Upload className="mr-2 h-4 w-4" />
                    Pilih File Excel
                  </Button>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mengimpor data...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {selectedFile && !isUploading && (
              <div className="flex justify-center">
                <Button onClick={handleUpload} size="lg" className="min-w-[200px]" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengimpor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data Tabung
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Import</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Format File Excel</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• File harus berformat .xlsx atau .xls</li>
                <li>• Maksimal ukuran file 5MB</li>
                <li>• Baris pertama harus berisi header kolom</li>
                <li>
                  • Untuk format excel dapat di unduh{' '}
                  <Link className="underline text-blue-600 font-medium" href="https://tinyurl.com/mrkeufue" target="_blank" rel="noopener noreferrer">
                    disini
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Kolom yang Diperlukan</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• barcode_id (Barcode Tabung, wajib)</li>
                <li>• serial_number (Nomor Tabung, wajib)</li>
                <li>• product_id (ID Tipe Tabung, wajib)</li>
                <li>• manufacture_date (Tanggal Produksi, contoh: 2023-10-14, wajib)</li>
                <li>• warehouse_id (ID Gudang, wajib)</li>
                <li>• status ('Di Gudang - Kosong'/'Di Gudang - Terisi', wajib)</li>
                <li>• last_fill_date (Tanggal pengisian terakhir, contoh: 2025-08-14, wajib jika status 'Di Gudang - Terisi')</li>
                <li>• notes (Catatan, opsional)</li>
              </ul>
            </div>
            <div>
              
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
