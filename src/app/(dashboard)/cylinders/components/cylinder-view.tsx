'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit, Calendar, MapPin, Package, Gauge, FileText, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Separator } from '../../../../components/ui/separator';
import { PageTransition } from '../../../../components/page-transition';
import type { CylinderDetail, StockMovement } from '../../../../types/cylinder';
import { STATUS_COLORS, EDITABLE_STATUSES, getMovementTypeColor, getMovementTypeLabel } from '../../../../constants/cylinder';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { MovementHistoryExport } from './movement-history-export';

interface CylinderDetailViewProps {
  cylinder: CylinderDetail;
}

interface MovementUser {
  name: string;
  username: string;
}

export default function CylinderDetailView({ cylinder }: CylinderDetailViewProps) {
  const router = useRouter();

  if (!cylinder) {
    return (
      <PageTransition>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Tabung gas tidak ditemukan</h2>
          <p className="text-muted-foreground mt-2">Data tabung gas yang Anda cari tidak tersedia.</p>
          <Button onClick={() => router.push('/cylinders')} className="mt-4">
            Kembali ke Daftar Tabung
          </Button>
        </div>
      </PageTransition>
    );
  }

  const canEdit = EDITABLE_STATUSES.includes(cylinder.status);
  const detailedMovements = (cylinder.stockMovements || []) as any[];

  return (
    <PageTransition>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push('/cylinders')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Detail Tabung Gas</h1>
              <p className="text-muted-foreground">Informasi lengkap tabung gas {cylinder.barcode_id}</p>
            </div>
          </div>
          {canEdit && (
            <Button onClick={() => router.push(`/cylinders/${cylinder.serial_number}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Status
            </Button>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informasi Dasar
                  </CardTitle>
                  <CardDescription>Data identifikasi dan spesifikasi tabung gas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Barcode ID</label>
                        <p className="text-lg font-mono font-semibold">{cylinder.barcode_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                        <p className="font-mono">{cylinder.serial_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <Badge className={STATUS_COLORS[cylinder.status]}>{cylinder.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Jenis Produk</label>
                        <p className="font-medium">{cylinder.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cylinder.product.sku} - {cylinder.product.unit}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Ownership</label>
                        <p className="">
                          {!cylinder.ownershipCylinders ? 'Milik Sendiri' : `${cylinder?.ownershipCylinders?.customer_name} ${cylinder?.ownershipCylinders?.company_name !== '' ? `(${cylinder?.ownershipCylinders?.company_name})` : ''}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tanggal & Lokasi
                  </CardTitle>
                  <CardDescription>Informasi tanggal penting dan lokasi tabung</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tanggal Produksi</label>
                        <p>{format(new Date(cylinder.manufacture_date), 'dd MMMM yyyy', { locale: indonesiaLocale })}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Pengisian Terakhir</label>
                        <p>{cylinder.last_fill_date ? format(new Date(cylinder.last_fill_date), 'dd MMMM yyyy', { locale: indonesiaLocale }) : 'Belum pernah diisi'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Lokasi Saat Ini</label>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            {cylinder.currentWarehouse ? (
                              <>
                                <p className="font-medium">{cylinder.currentWarehouse.name}</p>
                                <p className="text-sm text-muted-foreground">{cylinder.currentWarehouse?.address}</p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">Tidak berada di gudang</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {cylinder.notes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                        <p className="mt-1 text-sm bg-muted p-3 rounded-md">{cylinder.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Riwayat Pergerakan
                      </CardTitle>
                      <CardDescription>Log aktivitas dan pergerakan tabung gas</CardDescription>
                    </div>
                    <MovementHistoryExport cylinderId={cylinder.id} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detailedMovements.map((movement, index) => (
                      <motion.div key={movement.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0 last:pb-0">
                        <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={getMovementTypeColor(movement.movement_type)}>{getMovementTypeLabel(movement.movement_type)}</Badge>
                            <span className="text-xs text-muted-foreground">{format(new Date(movement.timestamp), 'dd MMM yyyy, HH:mm', { locale: indonesiaLocale })}</span>
                          </div>
                          <p className="text-sm">{movement.notes}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>
                                {movement.user.name} (@{movement.user.username})
                              </span>
                            </div>
                            {/* {movement.fromWarehouse && movement.toWarehouse ? (
                              <div className="flex items-center gap-1">
                                <span>{movement.fromWarehouse.name}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{movement.toWarehouse.name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{movement.fromWarehouse?.name || 'Tidak digudang'}</span>
                              </div>
                            )} */}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Statistik Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{cylinder.stockMovements?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Pergerakan</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">{Math.floor((new Date().getTime() - new Date(cylinder.manufacture_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}</div>
                      <div className="text-xs text-muted-foreground">Tahun</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-lg font-semibold">{cylinder.last_fill_date ? Math.floor((new Date().getTime() - new Date(cylinder.last_fill_date).getTime()) / (1000 * 60 * 60 * 24)) : '-'}</div>
                      <div className="text-xs text-muted-foreground">Hari Terakhir Diisi</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informasi Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID Tabung:</span>
                    <span className="font-mono">#{cylinder.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dibuat:</span>
                    <span>{format(new Date(cylinder.createdAt), 'dd MMM yyyy', { locale: indonesiaLocale })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diperbarui:</span>
                    <span>{format(new Date(cylinder.updatedAt), 'dd MMM yyyy', { locale: indonesiaLocale })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Milik Customer:</span>
                    <span>{cylinder.is_owned_by_customer ? 'Ya' : 'Tidak'}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
