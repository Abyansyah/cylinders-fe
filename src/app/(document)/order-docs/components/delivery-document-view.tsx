'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/page-transition';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { DeliveryDocument } from '@/types/delivery';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

export default function DeliveryDocumentView({ initialDocument }: { initialDocument: DeliveryDocument }) {
  const router = useRouter();
  const deliveryNote = initialDocument;
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  if (!deliveryNote) {
    return (
      <PageTransition>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Surat Jalan tidak ditemukan</h2>
              <Button asChild>
                <Link href="/orders">Kembali ke Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="print:hidden bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto p-4 max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Surat Jalan</h1>
                  <p className="text-sm text-muted-foreground">No: {deliveryNote.surat_jalan_number}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto p-6 max-w-4xl print:p-0 print:max-w-none">
          <motion.div ref={printRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="delivery-document bg-white rounded-lg shadow-sm p-8 print:shadow-none print:rounded-none">
            <header className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-800">
              <div className="flex items-start gap-4">
                <div className="w-24 flex-shrink-0">
                  <Image id="logo-for-pdf" src="/logo-KAP.png" alt="Logo" width={100} height={100} />
                </div>
                <div>
                  <h1 className="text-xl font-bold  mb-1">CV KARYA AGUNG PRATAMA</h1>
                  <p className="text-sm text-gray-600 max-w-md leading-tight">Desa Hulaan RT.010 RW.005 Hulaan, Menganti Kab. Gresik, Jawa Timur Kab. Gresik Jawa Timur</p>
                  <p className="text-sm text-gray-600">Telp 6282336755212</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <h2 className="text-2xl font-bold mb-1">Surat Jalan</h2>
                <p className="text-sm text-gray-600">{deliveryNote.surat_jalan_number}</p>
              </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 mb-6">
              <div className="border-2 border-gray-800 p-3">
                <h3 className="font-bold mb-2">Ditujukan untuk:</h3>
                <p className="font-semibold">{deliveryNote.customer_name}</p>
                <p className="text-sm">{deliveryNote.shipping_address_default}</p>
                <p className="text-sm">Telp: {deliveryNote.phone_number}</p>
              </div>

              <div className="border-2 border-gray-800 p-3">
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Tanggal:</span> {format(new Date(deliveryNote.createdAt), 'dd MMMM yyyy', { locale: indonesiaLocale })}
                  </p>
                  <p>
                    <span className="font-semibold">Metode Pengiriman:</span> {deliveryNote.shipping_method}
                  </p>
                  <p>
                    <span className="font-semibold">No. Resi:</span> {deliveryNote.tracking_number}
                  </p>
                  <p>
                    <span className="font-semibold">Nama Pengemudi:</span> {deliveryNote.nama_pengemudi}
                  </p>
                  <p>
                    <span className="font-semibold">No. Kendaraan:</span> {deliveryNote.vehicle_number}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="border border-gray-400 p-2 text-left w-12">No</th>
                    <th className="border border-gray-400 p-2 text-left">Nama Produk & Serial Number</th>
                    <th className="border border-gray-400 p-2 text-left w-32">Kode Produk</th>
                    <th className="border border-gray-400 p-2 text-center w-20">Kuantitas</th>
                    <th className="border border-gray-400 p-2 text-center w-16">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryNote.items.map((item) => (
                    <tr key={item.no}>
                      <td className="border border-gray-400 p-2 text-center">{item.no}</td>
                      <td className="border border-gray-400 p-2">
                        <div className="font-semibold">{item.product_name}</div>
                        {item.serial_numbers && item.serial_numbers.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            SN: <span className="font-mono">{item.serial_numbers.join(', ')}</span>
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-400 p-2 text-center font-mono">{item.product_code}</td>
                      <td className="border border-gray-400 p-2 text-center">{item.quantity}</td>
                      <td className="border border-gray-400 p-2 text-center">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <footer className="signatures grid grid-cols-2 gap-8 pt-96 mt-14">
              <div className="text-center">
                <p className="mb-20 text-sm">Diterima oleh,</p>
                <p className="font-bold ">{deliveryNote.customer_name}</p>
              </div>
              <div className="text-center">
                <p className="mb-20 text-sm">Dikirim oleh,</p>
                <p className="font-bold ">CV KARYA AGUNG PRATAMA</p>
              </div>
            </footer>
          </motion.div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0 !important;
          }
          html,
          body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important; /* Aktifkan background graphics */
            print-color-adjust: exact !important; /* Aktifkan background graphics */
          }
          .delivery-document {
            page-break-inside: avoid;
            break-inside: avoid;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 1cm !important;
          }
          .grid {
            display: grid !important;
          }
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          table,
          .signatures {
            page-break-inside: avoid;
          }
          /* Pastikan semua elemen penting ditampilkan */
          * {
            visibility: visible !important;
          }
          /* Aktifkan warna latar belakang */
          .bg-gray-700 {
            background-color: #4a5568 !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Tampilkan logo */
          #logo-for-pdf {
            display: block !important;
          }
        }
      `}</style>
    </PageTransition>
  );
}
