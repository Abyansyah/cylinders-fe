'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, FileX2 } from 'lucide-react';
import Link from 'next/link';

export default function AuditNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="p-4 bg-red-50 rounded-full mb-4">
        <FileX2 className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Audit Tidak Ditemukan</h2>
      <p className="text-muted-foreground mb-6">Maaf, data audit yang Anda cari tidak dapat ditemukan. Mungkin telah dihapus atau Anda salah memasukkan URL.</p>
      <Button asChild>
        <Link href="/customer-audit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Audit
        </Link>
      </Button>
    </div>
  );
}
