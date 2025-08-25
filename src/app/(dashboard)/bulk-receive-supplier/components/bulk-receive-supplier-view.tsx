'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Package, Scan, CheckCircle, XCircle, AlertTriangle, Trash2, Send, Building2, Warehouse, BarChart3, Clock, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarcodeScanner } from '@/components/features/barcode-scanner';
import { ConfirmationDialog } from '@/app/(dashboard)/loan-adjustments/components/confirmation-dialog';

import { useCurrentUser } from '@/hooks/use-current-user';
import { getWarehousesSelectList } from '@/services/SearchListService';
import { bulkReceiveFromSupplier, getSuppliersForSelect } from '@/services/refillOrderService';
import type { BulkReceiveResponse } from '@/types/refill-order';
import { useDebounce } from '@/hooks/use-debounce';

interface ScannedItem {
  identifier: string;
  timestamp: Date;
}

export default function BulkReceiveSupplierView() {
  const { user } = useCurrentUser();
  const [supplierId, setSupplierId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<BulkReceiveResponse | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isProcessConfirmOpen, setProcessConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [warehouseSearch, setWarehouseSearch] = useState('');

  const debouncedWarehouseSearch = useDebounce(warehouseSearch, 300);

  const { data: suppliersResponse } = useSWR('/select-lists/suppliers', getSuppliersForSelect);
  const { data: warehousesResponse, isLoading: isLoadingWarehouses } = useSWR(`/select-lists/warehouses?search=${debouncedWarehouseSearch}`, () => getWarehousesSelectList({ search: debouncedWarehouseSearch }));

  const suppliers = suppliersResponse?.data || [];
  const warehouses = warehousesResponse?.data || [];

  useEffect(() => {
    if (user?.warehouse_id) {
      setWarehouseId(user.warehouse_id.toString());
    }
    inputRef.current?.focus();
  }, [user]);

  const handleAddBarcode = (identifier: string) => {
    if (!identifier) return;

    if (scannedItems.some((item) => item.identifier === identifier)) {
      toast.error('Identifier sudah ada di dalam daftar.');
      setBarcodeInput('');
      return;
    }

    const newItem: ScannedItem = { identifier, timestamp: new Date() };
    setScannedItems((prev) => [newItem, ...prev]);
    setBarcodeInput('');
    toast.success('Item ditambahkan ke daftar.');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBarcodeSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!barcodeInput.trim()) return;
    handleAddBarcode(barcodeInput.trim());
  };

  const handleScan = (barcode: string) => {
    setShowScanner(false);
    handleAddBarcode(barcode);
  };

  const removeItem = (identifier: string) => {
    setScannedItems((prev) => prev.filter((item) => item.identifier !== identifier));
    toast.info('Item dihapus dari daftar.');
  };

  const handleClearAll = () => {
    setScannedItems([]);
    setClearConfirmOpen(false);
    toast.info('Semua item berhasil dihapus.');
  };

  const handleSubmit = async () => {
    setProcessConfirmOpen(false);
    setIsSubmitting(true);

    const payload = {
      supplier_id: Number(supplierId),
      identifiers: scannedItems.map((item) => item.identifier),
      ...(user?.warehouse_id ? { warehouse_id: user.warehouse_id } : { warehouse_id: Number(warehouseId) }),
    };

    try {
      const result = await bulkReceiveFromSupplier(payload);
      setResponse(result);
      setScannedItems([]);
      toast.success('Proses penerimaan selesai.');
    } catch (error: any) {
      toast.error('Gagal memproses penerimaan.', {
        description: error?.response?.data?.message || 'Terjadi kesalahan pada server.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = scannedItems.length > 0 && supplierId && (user?.warehouse_id || warehouseId);

  return (
    <>
      {showScanner && <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      <ConfirmationDialog
        open={isClearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Hapus Semua Item?"
        description={`Anda yakin ingin menghapus semua ${scannedItems.length} item dari daftar? Aksi ini tidak dapat diurungkan.`}
        confirmText="Ya, Hapus Semua"
        onConfirm={async () => handleClearAll()}
        variant="destructive"
      />
      <ConfirmationDialog
        open={isProcessConfirmOpen}
        onOpenChange={setProcessConfirmOpen}
        title="Proses Penerimaan?"
        description={`Anda akan memproses penerimaan untuk ${scannedItems.length} item dari supplier terpilih. Lanjutkan?`}
        confirmText="Ya, Proses"
        onConfirm={handleSubmit}
      />

      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Penerimaan Masal Supplier</h1>
            <p className="text-muted-foreground">Terima tabung dari supplier secara massal dengan scan barcode atau serial number.</p>
          </div>

          <Card className="my-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Form Penerimaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse *</Label>
                  {user?.warehouse_id ? (
                    <Input value={user.warehouse_name || `Gudang ID: ${user.warehouse_id}`} disabled />
                  ) : (
                    <Select value={warehouseId} onValueChange={setWarehouseId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((w) => (
                          <SelectItem key={w.value} value={w.value.toString()}>
                            {w.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode / Serial Number *</Label>
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    id="barcode"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan atau ketik barcode/serial number..."
                    disabled={!supplierId || (!warehouseId && !user?.warehouse_id)}
                    autoComplete="off"
                  />
                  <Button type="button" variant="outline" onClick={() => setShowScanner(true)}>
                    <Scan className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={!barcodeInput.trim()}>
                    Tambah
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {scannedItems.length > 0 && (
            <Card className="my-4">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap space-y-4">
                <CardTitle className="flex items-center gap-2">Item Siap Diterima ({scannedItems.length})</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="destructive" size="sm" onClick={() => setClearConfirmOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Hapus Semua
                  </Button>
                  <Button onClick={() => setProcessConfirmOpen(true)} disabled={!canSubmit || isSubmitting} size="sm">
                    <Send className="h-4 w-4 mr-2" /> Proses Penerimaan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {scannedItems.map((item) => (
                    <div key={item.identifier} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-mono text-sm font-medium">{item.identifier}</p>
                        <p className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString('id-ID')}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.identifier)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {response.summary.failed_items > 0 ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
                  Hasil Penerimaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription className="text-base">{response.message}</AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold">{response.summary.total_scanned}</div>
                    <div className="text-sm text-muted-foreground">Total Di-scan</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{response.summary.successfully_received}</div>
                    <div className="text-sm text-muted-foreground">Berhasil Diterima</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{response.summary.failed_items}</div>
                    <div className="text-sm text-muted-foreground">Gagal</div>
                  </Card>
                </div>
                {response.failed_items.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-red-600">Item Gagal ({response.failed_items.length})</h3>
                    {response.failed_items.map((item, index) => (
                      <Alert key={index} variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-mono font-medium">{item.identifier}</div>
                          <div className="text-sm mt-1">{item.reason}</div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
                {response.affected_refill_orders.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Order Refill Terdampak</h3>
                    {response.affected_refill_orders.map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg flex-wrap">
                        <p className="font-mono font-medium">{order.refill_order_number}</p>
                        <Badge>{order.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Separator />
                <div className="flex justify-center">
                  <Button onClick={() => setResponse(null)} variant="outline">
                    Lakukan Penerimaan Baru
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </>
  );
}
