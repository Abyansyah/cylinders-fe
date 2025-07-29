'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Building, Truck, Package, FileText, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import type { TTBKDetail } from '@/types/ttbk';
import useSWR from 'swr';
import { getTTBKById } from '@/services/ttbkService';
import { useRouter } from 'next/navigation';

interface TTBKDetailViewProps {
  initialTTBK: TTBKDetail;
}

export default function TTBKDetailView({ initialTTBK }: TTBKDetailViewProps) {
  const {
    data: ttbk,
    error,
    isLoading,
  } = useSWR(`/return-receipts/${initialTTBK.id}`, () => getTTBKById(initialTTBK.id), {
    fallbackData: initialTTBK,
  });

  const { back } = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!ttbk) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">TTBK tidak ditemukan</p>
          <Link href="/ttbk">
            <Button className="mt-4">Kembali ke TTBK</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <Button onClick={() => back()} variant="ghost" size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ttbk.ttbk_number}</h1>
            <Badge className={getStatusColor(ttbk.status)}>{ttbk.status}</Badge>
          </div>
          <p className="text-gray-600">Detail Tanda Terima Barang Kosong</p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Informasi TTBK
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nomor TTBK:</span>
                <span className="font-medium">{ttbk.ttbk_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Terima:</span>
                <span className="font-medium">{format(new Date(ttbk.receipt_date), 'dd MMMM yyyy', { locale: id })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge className={getStatusColor(ttbk.status)}>{ttbk.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tabung:</span>
                <span className="font-medium">{ttbk.details.length} tabung</span>
              </div>
              {ttbk.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-gray-600">Catatan:</span>
                    <p className="mt-1 text-sm">{ttbk.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-medium">{ttbk.customer.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Perusahaan:</span>
                <span className="font-medium">{ttbk.customer.company_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telepon:</span>
                <span className="font-medium">{ttbk.customer.phone_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{ttbk.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipe:</span>
                <span className="font-medium">{ttbk.customer.customer_type}</span>
              </div>
              <Separator />
              <div>
                <span className="text-gray-600">Alamat:</span>
                <p className="mt-1 text-sm">{ttbk.customer.shipping_address_default}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Informasi Driver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Driver:</span>
                <span className="font-medium">{ttbk.driver.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telepon:</span>
                <span className="font-medium">{ttbk.driver.phone_number}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Gudang Tujuan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Gudang:</span>
                <span className="font-medium">{ttbk.destinationWarehouse.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telepon:</span>
                <span className="font-medium">{ttbk.destinationWarehouse.phone_number}</span>
              </div>
              <Separator />
              <div>
                <span className="text-gray-600">Alamat:</span>
                <p className="mt-1 text-sm">{ttbk.destinationWarehouse.address}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Detail Tabung ({ttbk.details.length} tabung)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {ttbk.details.map((detail, index) => (
                <motion.div key={detail.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.05 }} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">Tabung #{detail.cylinder.id}</p>
                      <p className="text-sm text-gray-600 font-mono">{detail.cylinder.barcode_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ditambahkan: {format(new Date(detail.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
