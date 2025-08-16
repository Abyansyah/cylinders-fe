'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ReplacementBarcodeDialog } from './replacement-barcode-dialog';
import { Search, Package, QrCode, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import type { CylinderForReplacement } from '@/types/replacement-barcode';
import { getCylinderForReplacement, replaceBarcode } from '@/services/cylinderService';

export default function ReplacementBarcodeForm() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [foundCylinder, setFoundCylinder] = React.useState<CylinderForReplacement | null>(null);
  const [showDialog, setShowDialog] = React.useState(false);

  // Form states
  const [serialNumberConfirmation, setSerialNumberConfirmation] = React.useState('');
  const [newBarcode, setNewBarcode] = React.useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Error', {
        description: 'Masukkan serial number untuk mencari',
      });
      return;
    }

    setIsSearching(true);

    try {
      const cylinder = await getCylinderForReplacement(searchQuery);
      setFoundCylinder(cylinder);
      setSerialNumberConfirmation('');
      setNewBarcode('');
      toast.success('Tabung Ditemukan', {
        description: `Serial number ${cylinder.serial_number} berhasil ditemukan`,
      });
    } catch (error: any) {
      setFoundCylinder(null);
      toast.error('Tabung Tidak Ditemukan', {
        description: error.response?.data?.message || 'Serial number tidak ditemukan dalam sistem',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundCylinder) {
      toast.error('Error', {
        description: 'Silakan cari tabung terlebih dahulu',
      });
      return;
    }
    if (serialNumberConfirmation !== foundCylinder.serial_number) {
      toast.error('Error', {
        description: 'Konfirmasi serial number tidak sesuai',
      });
      return;
    }

    if (newBarcode === foundCylinder.barcode_id) {
      toast.error('Error', {
        description: 'Barcode baru tidak boleh sama dengan barcode lama',
      });
      return;
    }

    setShowDialog(true);
  };

  const handleConfirmReplacement = async () => {
    if (!foundCylinder) return;

    try {
      await replaceBarcode({
        serial_number: foundCylinder.serial_number,
        new_barcode_id: newBarcode,
      });
      toast.success('Berhasil', {
        description: 'Barcode berhasil diganti',
      });

      setShowDialog(false);
      setFoundCylinder(null);
      setSearchQuery('');
      setSerialNumberConfirmation('');
      setNewBarcode('');
    } catch (error: any) {
      toast.error('Gagal Mengganti Barcode', {
        description: error.response?.data?.message || 'Terjadi kesalahan',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Di Gudang - Kosong':
        return 'secondary';
      case 'Di Gudang - Terisi':
        return 'default';
      case 'Perlu Inspeksi':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Replacement Barcode</h1>
        <p className="text-muted-foreground">Ganti barcode tabung yang rusak atau tidak terbaca</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Cari Tabung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Serial Number</Label>
              <Input id="search" placeholder="Masukkan serial number tabung..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Mencari...' : 'Cari'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {foundCylinder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Tabung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                <p className="font-semibold">{foundCylinder.serial_number}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Barcode Saat Ini</Label>
                <p className="font-mono font-semibold">{foundCylinder.barcode_id}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant={getStatusBadgeVariant(foundCylinder.status)}>{foundCylinder.status}</Badge>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Jenis Produk</Label>
                <p className="font-semibold">{foundCylinder?.product?.name}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Lokasi Saat Ini</Label>
                <p className="font-semibold">{foundCylinder.currentWarehouse.name}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Tanggal Produksi</Label>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(foundCylinder.manufacture_date).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Terakhir Diisi</Label>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {foundCylinder.last_fill_date ? new Date(foundCylinder.last_fill_date).toLocaleDateString('id-ID') : 'Belum pernah'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {foundCylinder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Form Penggantian Barcode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serial-confirmation">
                    Konfirmasi Serial Number <span className="text-red-500">*</span>
                  </Label>
                  <Input id="serial-confirmation" placeholder="Ketik ulang serial number untuk konfirmasi" value={serialNumberConfirmation} onChange={(e) => setSerialNumberConfirmation(e.target.value)} required />
                  {serialNumberConfirmation && serialNumberConfirmation !== foundCylinder.serial_number && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Serial number tidak sesuai
                    </p>
                  )}
                  {serialNumberConfirmation && serialNumberConfirmation === foundCylinder.serial_number && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Serial number sesuai
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-barcode">
                    Barcode Baru <span className="text-red-500">*</span>
                  </Label>
                  <Input id="new-barcode" placeholder="Masukkan barcode baru" value={newBarcode} onChange={(e) => setNewBarcode(e.target.value)} required />
                  {newBarcode && newBarcode === foundCylinder.barcode_id && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Barcode baru tidak boleh sama dengan barcode lama
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={!serialNumberConfirmation || !newBarcode || serialNumberConfirmation !== foundCylinder.serial_number || newBarcode === foundCylinder.barcode_id}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Ganti Barcode
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <ReplacementBarcodeDialog open={showDialog} onOpenChange={setShowDialog} cylinder={foundCylinder} newBarcode={newBarcode} serialNumberConfirmation={serialNumberConfirmation} onConfirm={handleConfirmReplacement} />
    </div>
  );
}
