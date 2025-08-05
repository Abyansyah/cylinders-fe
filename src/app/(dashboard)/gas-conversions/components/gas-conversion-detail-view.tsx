'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Calendar, User, MapPin, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { STATUS_LABELS, STATUS_COLORS } from '@/constants/gas-conversion';
import type { GasConversionDetail } from '@/types/gas-conversion';
import useSWR from 'swr';
import { getGasConversionDetail } from '@/services/gasConversionService';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return <Clock className="h-4 w-4" />;
    case 'APPROVED':
      return <CheckCircle className="h-4 w-4" />;
    case 'REJECTED':
      return <XCircle className="h-4 w-4" />;
    case 'PARTIALLY_COMPLETED':
      return <AlertCircle className="h-4 w-4" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function GasConversionDetailView({ initialData }: { initialData: GasConversionDetail }) {
  const params = useParams();
  const router = useRouter();
  const auditId = Number(params.id);

  const { data, isLoading } = useSWR(`/gas-conversions/${auditId}`, () => getGasConversionDetail(auditId).then((res) => res.data), {
    fallbackData: initialData,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Data tidak ditemukan</h2>
          <p className="text-gray-600 mt-2">Permintaan alih fungsi gas tidak dapat ditemukan.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  const { request_header, execution_details } = data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request_header.request_number}</h1>
            <p className="text-sm text-gray-600">Detail Permintaan Alih Fungsi Gas</p>
          </div>
        </div>
        <Badge className={`${STATUS_COLORS[request_header.status]} flex items-center space-x-1`}>
          {getStatusIcon(request_header.status)}
          <span>{STATUS_LABELS[request_header.status]}</span>
        </Badge>
      </div>

      {/* Request Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Informasi Permintaan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nomor Permintaan</label>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">{request_header.request_number}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Permintaan</label>
                <p className="text-sm flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(request_header.request_date)}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Jenis Kemasan</label>
                <p className="text-sm">{request_header.packaging_type}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Pemohon</label>
                <p className="text-sm flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{request_header.requester_name}</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Produk Asal</label>
                <p className="text-sm bg-red-50 text-red-800 px-2 py-1 rounded">{request_header.from_product.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Produk Tujuan</label>
                <p className="text-sm bg-green-50 text-green-800 px-2 py-1 rounded">{request_header.to_product.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Kuantitas</label>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold text-green-600">{request_header.quantity_fulfilled}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{request_header.quantity_requested}</span>
                  <span className="text-xs text-gray-500">unit</span>
                </div>
              </div>

              {request_header.execution_warehouse && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Gudang Eksekusi</label>
                  <p className="text-sm flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{request_header.execution_warehouse.name}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {request_header.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <label className="text-sm font-medium text-gray-600">Catatan</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{request_header.notes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {request_header.approval_details && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Informasi Persetujuan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Penyetuju</label>
                <p className="text-sm flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{request_header.approval_details.approver_name}</span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Tanggal Persetujuan</label>
                <p className="text-sm flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(request_header.approval_details.approval_date)}</span>
                </p>
              </div>
            </div>

            {request_header.approval_details.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Catatan Persetujuan</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{request_header.approval_details.notes}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {execution_details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Detail Eksekusi</span>
              </div>
              <Badge variant="secondary">{execution_details.length} tabung diproses</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {execution_details.map((detail, index) => (
                <div key={detail.cylinder_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">{index + 1}</div>
                    <div>
                      <p className="font-medium text-sm">
                        Barcode: <span className="font-mono">{detail.barcode_id}</span>
                      </p>
                      <p className="text-xs text-gray-600">Serial: {detail.serial_number}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">{detail.executed_by_name}</p>
                    <p className="text-xs text-gray-600">{formatDateTime(detail.executed_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
