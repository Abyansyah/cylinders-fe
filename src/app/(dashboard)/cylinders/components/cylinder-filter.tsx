import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Loader2, ScanLine, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSWR from 'swr';
import { getWarehouses } from '@/services/warehouseService';
import { CYLINDER_STATUSES } from '@/constants/cylinder';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface CylinderFilterProps {
  searchTerm: string;
  selectedWarehouse: string;
  selectedStatus: string;
  handleSearch: (value: string) => void;
  setSelectedWarehouse: (value: string) => void;
  setSelectedStatus: (value: string) => void;
  setShowScanner: (value: boolean) => void;
  onResetFilter: () => void;
}

export default function CylinderFilter({ searchTerm, selectedWarehouse, selectedStatus, handleSearch, setSelectedWarehouse, setSelectedStatus, setShowScanner, onResetFilter }: CylinderFilterProps) {
  const { user } = useAuthStore();
  const isPetugasGudang = user?.role.role_name === 'Petugas Gudang';

  const { data: warehousesResponse, isLoading: isLoadingWarehouses } = useSWR(!isPetugasGudang ? '/warehouses?limit=50' : null, () => getWarehouses({ limit: 50 }), {
    revalidateOnFocus: false,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
          <CardDescription>Gunakan filter untuk mencari tabung gas berdasarkan kriteria tertentu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn('grid gap-4', isPetugasGudang ? 'md:grid-cols-3' : 'md:grid-cols-4')}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari barcode atau serial..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="pl-8 pr-10" />
                <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowScanner(true)}>
                  <ScanLine className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isPetugasGudang && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Gudang</label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse} disabled={isLoadingWarehouses}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gudang" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingWarehouses ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memuat gudang...
                      </div>
                    ) : (
                      <>
                        <SelectItem value="all">Semua Gudang</SelectItem>
                        {warehousesResponse?.data?.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {CYLINDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={onResetFilter} variant="outline" className="w-full">
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
