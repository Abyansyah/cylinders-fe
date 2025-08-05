'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Check, X, Building2, ArrowRightLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import type { GasConversion, ApprovalRequest, ReassignWarehouseRequest } from '@/types/gas-conversion';
import { useIsMobile } from '@/hooks/use-mobile';
import { getGasConversions, approveGasConversion, rejectGasConversion, reassignWarehouse } from '@/services/gasConversionService';
import { getWarehouses } from '@/services/warehouseService';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { WarehouseSearchCombobox } from '../../loan-adjustments/components/warehouse-search-combobox';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';

const STATUS_COLORS: { [key: string]: string } = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  PARTIALLY_COMPLETED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: { [key: string]: string } = {
  PENDING_APPROVAL: 'Menunggu Persetujuan',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PARTIALLY_COMPLETED: 'Sebagian Selesai',
  COMPLETED: 'Selesai',
};

export default function GasConversionList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { checkPermission } = usePermission();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [startDate, setStartDate] = useState<Date | undefined>(searchParams.get('start_date') ? new Date(searchParams.get('start_date')!) : undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(searchParams.get('end_date') ? new Date(searchParams.get('end_date')!) : undefined);

  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; item: GasConversion | null; action: 'approve' | 'reject' | null }>({ open: false, item: null, action: null });
  const [warehouseDialog, setWarehouseDialog] = useState<{ open: boolean; item: GasConversion | null }>({ open: false, item: null });
  const [approvalForm, setApprovalForm] = useState<ApprovalRequest>({ assigned_warehouse_id: undefined, notes: '' });
  const [newWarehouseId, setNewWarehouseId] = useState<number | undefined>();

  const isMobile = useIsMobile();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(limit));
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (startDate) params.set('start_date', format(startDate, 'yyyy-MM-dd'));
    if (endDate) params.set('end_date', format(endDate, 'yyyy-MM-dd'));
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, selectedStatus, startDate, endDate, router, pathname, limit]);

  const { data: conversionsResponse, isLoading, mutate } = useSWR(['/gas-conversions', searchParams.toString()], () => getGasConversions(searchParams));
  const { data: warehousesResponse } = useSWR('/warehouses', () => getWarehouses({}));

  const conversions = conversionsResponse?.data || [];
  const totalPages = conversionsResponse?.totalPages || 0;
  const warehouses = warehousesResponse?.data || [];

  const stats = useMemo(() => {
    const total = conversionsResponse?.totalItems || 0;
    const pending = conversions.filter((item) => item.status === 'PENDING_APPROVAL').length;
    const approved = conversions.filter((item) => item.status === 'APPROVED').length;
    const completed = conversions.filter((item) => item.status === 'COMPLETED').length;
    return { total, pending, approved, completed };
  }, [conversions, conversionsResponse]);

  const handleApproval = (item: GasConversion, action: 'approve' | 'reject') => {
    setApprovalDialog({ open: true, item, action });
    setApprovalForm({ assigned_warehouse_id: undefined, notes: '' });
  };

  const handleWarehouseChange = (item: GasConversion) => {
    setWarehouseDialog({ open: true, item });
    setNewWarehouseId(item.assigned_warehouse_id || undefined);
  };

  const submitApproval = async () => {
    if (!approvalDialog.item || !approvalDialog.action) return;

    try {
      if (approvalDialog.action === 'approve') {
        await approveGasConversion(approvalDialog.item.id, approvalForm);
        toast.success('Permintaan berhasil disetujui');
      } else {
        await rejectGasConversion(approvalDialog.item.id, { notes: approvalForm.notes });
        toast.success('Permintaan berhasil ditolak');
      }
      mutate();
      setApprovalDialog({ open: false, item: null, action: null });
    } catch (error: any) {
      toast.error('Gagal memproses permintaan', { description: error.response?.data?.message });
    }
  };

  const submitWarehouseChange = async () => {
    if (!warehouseDialog.item || !newWarehouseId) return;

    try {
      const payload: ReassignWarehouseRequest = {
        new_warehouse_id: newWarehouseId,
        notes: 'PP',
      };
      await reassignWarehouse(warehouseDialog.item.id, payload);
      toast.success('Gudang berhasil diganti');
      mutate();
      setWarehouseDialog({ open: false, item: null });
    } catch (error: any) {
      toast.error('Gagal mengganti gudang', { description: error.response?.data?.message });
    }
  };

  const columns: ColumnDef<GasConversion>[] = [
    { accessorKey: 'request_number', header: ({ column }) => <DataTableColumnHeader column={column} title="Nomor Permintaan" /> },
    { accessorKey: 'packaging_type', header: ({ column }) => <DataTableColumnHeader column={column} title="Jenis Kemasan" /> },
    {
      id: 'conversion',
      header: 'Konversi',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">{row.original.fromProduct.name}</div>
          <div className="text-xs text-muted-foreground">↓</div>
          <div className="text-sm">{row.original.toProduct.name}</div>
        </div>
      ),
    },
    { accessorKey: 'quantity', header: ({ column }) => <DataTableColumnHeader column={column} title="Jumlah" /> },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <Badge className={STATUS_COLORS[row.original.status]}>{STATUS_LABELS[row.original.status]}</Badge>,
    },
    {
      accessorKey: 'requester.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Pemohon" />,
      cell: ({ row }) => row.original.requester.name,
    },
    {
      accessorKey: 'assignedWarehouse.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Gudang Ditugaskan" />,
      cell: ({ row }) => row.original.assignedWarehouse?.name || '-',
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const { checkPermission } = usePermission();
        const canApprove = checkPermission(PERMISSIONS.gasConversion.approve);
        const canReassign = checkPermission(PERMISSIONS.gasConversion.reassign_warehouse);
        return (
          <div className="flex items-center gap-2">
            {row.original.status === 'COMPLETED' && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/gas-conversions/${row.original.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {row.original.status === 'PENDING_APPROVAL' && canApprove && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleApproval(row.original, 'approve')} className="text-green-600 hover:text-green-700">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleApproval(row.original, 'reject')} className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            {(row.original.status === 'APPROVED' || row.original.status === 'PARTIALLY_COMPLETED') && canReassign && (
              <Button size="sm" variant="outline" onClick={() => handleWarehouseChange(row.original)}>
                <Building2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const pagination = useMemo<PaginationState>(
    () => ({
      pageIndex: page - 1,
      pageSize: limit,
    }),
    [page, limit]
  );

  const handlePaginationChange = (updater: any) => {
    const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (newPagination.pageIndex + 1).toString());
    params.set('limit', newPagination.pageSize.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const ApprovalDialogContent = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nomor Permintaan</Label>
          <div className="text-sm text-muted-foreground">{approvalDialog.item?.request_number}</div>
        </div>
        <div className="space-y-2">
          <Label>Konversi</Label>
          <div className="text-sm text-muted-foreground">
            {approvalDialog.item?.fromProduct.name} → {approvalDialog.item?.toProduct.name}
          </div>
        </div>
        {approvalDialog.action === 'approve' && (
          <div className="space-y-2">
            <Label htmlFor="warehouse">Gudang yang Ditugaskan *</Label>
            <WarehouseSearchCombobox value={approvalForm?.assigned_warehouse_id?.toString() || ''} onChange={(value) => setApprovalForm((prev) => ({ ...prev, assigned_warehouse_id: value ? Number.parseInt(value) : undefined }))} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan *</Label>
          <Textarea
            id="notes"
            placeholder={approvalDialog.action === 'approve' ? 'Catatan persetujuan...' : 'Alasan penolakan...'}
            value={approvalForm.notes}
            onChange={(e) => setApprovalForm((prev) => ({ ...prev, notes: e.target.value }))}
            rows={3}
          />
        </div>
      </div>
    </>
  );

  const WarehouseDialogContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Gudang Saat Ini</Label>
        <div className="text-sm text-muted-foreground">{warehouses.find((w) => w.id === warehouseDialog.item?.assigned_warehouse_id)?.name || 'Belum ditentukan'}</div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-warehouse">Gudang Baru</Label>
        <WarehouseSearchCombobox value={newWarehouseId?.toString() || ''} onChange={(value) => setNewWarehouseId(value ? Number.parseInt(value) : undefined)} />
      </div>
    </div>
  );

  const canCreate = checkPermission(PERMISSIONS.gasConversion.create);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alih Fungsi Gas</h1>
          <p className="text-muted-foreground">Kelola permintaan pengalihan jenis gas pada tabung</p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/gas-conversions/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Permintaan
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Cari nomor permintaan, produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* <DatePicker date={startDate} setDate={setStartDate} placeholder="Tanggal Mulai" />
        <DatePicker date={endDate} setDate={setEndDate} placeholder="Tanggal Selesai" /> */}
      </div>

      <DataTable columns={columns} data={conversions} isLoading={isLoading} pageCount={totalPages} pagination={pagination} onPaginationChange={handlePaginationChange} />

      {isMobile ? (
        <Drawer open={approvalDialog.open} onOpenChange={(open) => !open && setApprovalDialog({ open: false, item: null, action: null })}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{approvalDialog.action === 'approve' ? 'Setujui Permintaan' : 'Tolak Permintaan'}</DrawerTitle>
              <DrawerDescription>{approvalDialog.action === 'approve' ? 'Pilih gudang dan berikan catatan persetujuan' : 'Berikan alasan penolakan'}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">{ApprovalDialogContent()}</div>
            <DrawerFooter>
              <Button
                onClick={submitApproval}
                disabled={!approvalForm.notes || (approvalDialog.action === 'approve' && !approvalForm.assigned_warehouse_id)}
                className={approvalDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {approvalDialog.action === 'approve' ? 'Setujui' : 'Tolak'}
              </Button>
              <Button variant="outline" onClick={() => setApprovalDialog({ open: false, item: null, action: null })}>
                Batal
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={approvalDialog.open} onOpenChange={(open) => !open && setApprovalDialog({ open: false, item: null, action: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{approvalDialog.action === 'approve' ? 'Setujui Permintaan' : 'Tolak Permintaan'}</DialogTitle>
              <DialogDescription>{approvalDialog.action === 'approve' ? 'Pilih gudang dan berikan catatan persetujuan' : 'Berikan alasan penolakan'}</DialogDescription>
            </DialogHeader>
            {ApprovalDialogContent()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialog({ open: false, item: null, action: null })}>
                Batal
              </Button>
              <Button
                onClick={submitApproval}
                disabled={!approvalForm.notes || (approvalDialog.action === 'approve' && !approvalForm.assigned_warehouse_id)}
                className={approvalDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {approvalDialog.action === 'approve' ? 'Setujui' : 'Tolak'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Drawer open={warehouseDialog.open} onOpenChange={(open) => !open && setWarehouseDialog({ open: false, item: null })}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Ganti Gudang</DrawerTitle>
              <DrawerDescription>Pilih gudang baru untuk permintaan {warehouseDialog.item?.request_number}</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-4">{WarehouseDialogContent()}</div>
            <DrawerFooter>
              <Button onClick={submitWarehouseChange} disabled={!newWarehouseId}>
                Simpan Perubahan
              </Button>
              <Button variant="outline" onClick={() => setWarehouseDialog({ open: false, item: null })}>
                Batal
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={warehouseDialog.open} onOpenChange={(open) => !open && setWarehouseDialog({ open: false, item: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ganti Gudang</DialogTitle>
              <DialogDescription>Pilih gudang baru untuk permintaan {warehouseDialog.item?.request_number}</DialogDescription>
            </DialogHeader>
            {WarehouseDialogContent()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setWarehouseDialog({ open: false, item: null })}>
                Batal
              </Button>
              <Button onClick={submitWarehouseChange} disabled={!newWarehouseId}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
