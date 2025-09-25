'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, User, Building2, Calendar, Package, FileText, Barcode } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { PICKUP_TYPES } from '@/constants/advanced-return';
import { AdvancedReturn } from '@/types/advanced-return';

interface AdvancedReturnDetailPageProps {
  returnData: AdvancedReturn;
}

export default function AdvancedReturnDetailPage({ returnData }: AdvancedReturnDetailPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pickupTypeLabel = PICKUP_TYPES.find((type) => type.value === returnData.pickup_type)?.label;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/advanced-return">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{returnData.return_number}</h1>
            <p className="text-muted-foreground">Detail Advanced Return - {formatDate(returnData.return_date)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="font-medium">{returnData.customer.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{returnData.customer.company_name}</div>
                </div>
                <div className="text-sm text-muted-foreground">ID: {returnData.customer.id}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Gudang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="font-medium">{returnData.warehouse.name}</div>
                </div>
                <div className="text-sm text-muted-foreground">ID: {returnData.warehouse.id}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Informasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Tanggal Return</div>
                  <div className="font-medium">{formatDate(returnData.return_date)}</div>
                </div>
                <div>
                  <Badge variant={returnData.pickup_type === 'COMPLAIN_CLAIM' ? 'destructive' : 'secondary'}>{pickupTypeLabel}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Catatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{returnData.notes}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Items */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Daftar Item ({returnData.details?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnData.details?.map((detail, index) => (
                  <motion.div key={detail.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 * index }} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Barcode className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{detail.cylinder.product.name}</div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Barcode: {detail.cylinder.barcode_id}</div>
                            <div>Nomor Tabung: {detail.cylinder.serial_number}</div>
                            <div>Status: {detail.cylinder.status}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm text-muted-foreground mb-1">Alasan</div>
                        <div className="font-medium text-sm max-w-[200px]">{detail.reason}</div>
                        <div className="text-xs text-muted-foreground mt-2">{formatDateTime(detail.created_at)}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
