'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/gas-conversion';
import useSWR from 'swr';
import { getWarehouseTasks } from '@/services/gasConversionService';
import { getWarehouses } from '@/services/warehouseService';
import { GasConversion } from '@/types/gas-conversion';

export default function WarehouseTaskList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  const { data: tasksResponse, isLoading: isLoadingTasks } = useSWR('/gas-conversions/warehouse/approved-tasks', getWarehouseTasks);
  const { data: warehousesResponse } = useSWR('/warehouses', () => getWarehouses({}));

  const warehouseTasks = tasksResponse?.data || [];
  const warehouses = warehousesResponse?.data || [];

  const filteredTasks = useMemo(() => {
    return warehouseTasks.filter((item) => {
      const matchesSearch =
        item.request_number.toLowerCase().includes(searchTerm.toLowerCase()) || item.fromProduct.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.toProduct.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWarehouse = selectedWarehouse === 'all' || item.assigned_warehouse_id?.toString() === selectedWarehouse;
      return matchesSearch && matchesWarehouse;
    });
  }, [warehouseTasks, searchTerm, selectedWarehouse]);

  if (isLoadingTasks) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tugas Gudang - Alih Fungsi Gas</h1>
        <p className="text-muted-foreground">Kelola tugas pengalihan jenis gas yang telah disetujui</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Cari nomor permintaan, produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada tugas</h3>
            <p className="text-muted-foreground text-center">Belum ada tugas alih fungsi gas yang perlu dikerjakan saat ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredTasks.map((task: GasConversion) => {
            const progress = (task.fulfilled_quantity / task.quantity) * 100;

            return (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{task.request_number}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(task.request_date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Konversi</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{task.fromProduct.name}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.toProduct.name}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Gudang</h4>
                      <p className="text-sm">{task.assignedWarehouse?.name || 'Belum ditentukan'}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Progress</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {task.fulfilled_quantity}/{task.quantity}
                      </span>
                    </div>
                  </div>

                  {task.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Catatan</h4>
                      <p className="text-sm">{task.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm text-muted-foreground">Jenis: {task.packaging_type}</div>
                    <Button asChild size="sm">
                      <Link href={`/gas-conversions/warehouse/${task.id}/scan`}>Mulai Scan</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
