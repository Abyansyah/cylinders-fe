'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Plus, Scan, Trash2, Package, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarcodeScanner } from '@/components/features/barcode-scanner';
import { UpdateResultsDialog } from './update-results-dialog';
import { CylinderStatusUpdateRequest, CylinderStatusUpdateResponse, CylinderStatusOption } from '@/types/cylinder-status-update';
import { toast } from 'sonner';
import useSWR from 'swr';
import { getGasTypes } from '@/services/gasTypeService';
import { bulkUpdateCylinderStatus } from '@/services/cylinderService';
import { GenericSearchCombobox } from '@/components/ui/GenericSearchCombobox';
import { getGasTypeSelectList } from '@/services/SearchListService';

const CYLINDER_STATUS_OPTIONS: { value: CylinderStatusOption; label: string }[] = [
  { value: 'Di Gudang - Terisi', label: 'Di Gudang - Terisi' },
  { value: 'Di Gudang - Kosong', label: 'Di Gudang - Kosong' },
  { value: 'Perlu Inspeksi', label: 'Perlu Inspeksi' },
];

export default function CylinderStatusUpdateForm() {
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CylinderStatusOption | ''>('');
  const [selectedGasType, setSelectedGasType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [results, setResults] = useState<CylinderStatusUpdateResponse | null>(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const { data: gasTypesResponse } = useSWR('/gas-types', () => getGasTypes({ limit: 1000 }), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  });
  const gasTypes = gasTypesResponse?.data || [];

  const handleAddBarcode = () => {
    if (!currentBarcode.trim()) return;

    if (barcodes.includes(currentBarcode.trim())) {
      toast.error('Barcode sudah ada', {
        description: 'Barcode ini sudah ditambahkan ke daftar',
      });
      return;
    }

    setBarcodes([...barcodes, currentBarcode.trim()]);
    setCurrentBarcode('');
  };

  const handleScanBarcode = (barcode: string) => {
    if (barcodes.includes(barcode)) {
      toast.error('Barcode sudah ada', {
        description: 'Barcode ini sudah ditambahkan ke daftar',
      });
      return;
    }
    setBarcodes([...barcodes, barcode]);
    toast.success('Barcode ditambahkan', {
      description: `Barcode ${barcode} berhasil ditambahkan`,
    });
    setIsScannerOpen(false);
  };

  const handleRemoveBarcode = (index: number) => {
    setBarcodes(barcodes.filter((_, i) => i !== index));
  };

  const handleBulkInput = (text: string) => {
    const newBarcodes = text
      .split(/[\n,]/)
      .map((b) => b.trim())
      .filter((b) => b && !barcodes.includes(b));

    setBarcodes([...barcodes, ...newBarcodes]);
    setCurrentBarcode('');
  };

  const handleSubmit = async () => {
    if (barcodes.length === 0 || !selectedStatus) {
      toast.error('Error', { description: 'Harap isi semua field yang diperlukan.' });
      return;
    }
    if (selectedStatus === 'Di Gudang - Terisi' && !selectedGasType) {
      toast.error('Error', { description: "Jenis gas harus dipilih untuk status 'Di Gudang - Terisi'" });
      return;
    }

    setIsLoading(true);

    try {
      const requestData: CylinderStatusUpdateRequest = {
        barcodes,
        new_status: selectedStatus,
        ...(selectedStatus === 'Di Gudang - Terisi' && { gas_type_id: parseInt(selectedGasType) }),
      };

      const response = await bulkUpdateCylinderStatus(requestData);
      setResults(response);
      setIsResultsOpen(true);
      toast.success('Update selesai', {
        description: 'Proses update status tabung telah selesai',
      });
      handleReset();
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Terjadi kesalahan saat mengupdate status tabung',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBarcodes([]);
    setCurrentBarcode('');
    setSelectedStatus('');
    setSelectedGasType('');
  };

  const requiresGasType = selectedStatus === 'Di Gudang - Terisi';
  const getScrollHeight = () => {
    if (barcodes.length <= 5) return 'auto';
    if (barcodes.length <= 10) return '240px';
    if (barcodes.length <= 20) return '320px';
    return '400px';
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Ubah Status Tabung</h1>
          </div>
          <p className="text-muted-foreground">Update status tabung secara massal dengan memindai atau memasukkan barcode</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Form Update Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="barcode">Input Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Masukkan barcode atau pisahkan dengan koma/enter"
                  value={currentBarcode}
                  onChange={(e) => setCurrentBarcode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (currentBarcode.includes(',') || currentBarcode.includes('\n')) {
                        handleBulkInput(currentBarcode);
                      } else {
                        handleAddBarcode();
                      }
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                  <Scan className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (currentBarcode.includes(',') || currentBarcode.includes('\n')) {
                      handleBulkInput(currentBarcode);
                    } else {
                      handleAddBarcode();
                    }
                  }}
                  disabled={!currentBarcode.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Tip: Pisahkan multiple barcode dengan koma atau enter untuk input sekaligus</p>
            </div>

            {barcodes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Daftar Barcode ({barcodes.length})</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setBarcodes([])}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Hapus Semua
                  </Button>
                </div>

                <div className="border rounded-md bg-gray-50">
                  <ScrollArea style={{ height: getScrollHeight() }} className="w-full">
                    <div className="p-3 space-y-2">
                      {barcodes.map((barcode, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <span className="font-mono text-sm font-medium">{barcode}</span>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBarcode(index)} className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {barcodes.length > 10 && (
                    <div className="px-3 py-2 bg-gray-100 border-t text-xs text-gray-600 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span>Scroll untuk melihat semua item</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  <span>Total: {barcodes.length} item</span>
                  {barcodes.length > 10 && <span>Area dapat di-scroll untuk navigasi</span>}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="status">Status Baru *</Label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as CylinderStatusOption)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status baru" />
                </SelectTrigger>
                <SelectContent>
                  {CYLINDER_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {requiresGasType && (
              <div className="space-y-3">
                <Label htmlFor="gasType">Jenis Gas *</Label>
                <GenericSearchCombobox<any> value={selectedGasType} onChange={setSelectedGasType} fetcher={getGasTypeSelectList} labelExtractor={(item) => item.name} placeholder="Pilih jenis gas" searchKey="/gas-types" />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Jenis gas wajib dipilih untuk status "Di Gudang - Terisi"</AlertDescription>
                </Alert>
              </div>
            )}

            <Separator />

            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={isLoading || barcodes.length === 0 || !selectedStatus || (requiresGasType && !selectedGasType)} className="flex-1">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update Status ({barcodes.length})
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </div>

            {barcodes.length > 0 && selectedStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-blue-900">Ringkasan Update:</div>
                  <div className="text-blue-700 mt-1">
                    • {barcodes.length} tabung akan diubah ke status "{selectedStatus}"{requiresGasType && selectedGasType && <div>• Jenis gas: {gasTypes.find((g) => g.id.toString() === selectedGasType)?.name}</div>}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isScannerOpen && <BarcodeScanner onClose={() => setIsScannerOpen(false)} onScan={handleScanBarcode} />}

      <UpdateResultsDialog isOpen={isResultsOpen} onClose={() => setIsResultsOpen(false)} results={results} />
    </div>
  );
}
