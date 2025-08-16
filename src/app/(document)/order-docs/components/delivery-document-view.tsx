'use client';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { DeliveryDocument } from '@/types/delivery';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import { ArrowLeft, FileText, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const ITEMS_PER_FIRST_PAGE = 12;
const ITEMS_PER_SUBSEQUENT_PAGE = 25;

const DocumentHeader = ({ document }: { document: DeliveryDocument }) => (
  <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
    <div className="flex items-start gap-4">
      <div className="w-24 flex-shrink-0">
        <Image src="/logo-KAP.png" alt="Logo" width={90} height={90} />
      </div>
      <div>
        <h1 className="text-xl font-bold mb-1">CV KARYA AGUNG PRATAMA</h1>
        <p className="text-sm text-gray-600 max-w-md leading-tight">Desa Hulaan RT.010 RW.005 Hulaan, Menganti Kab. Gresik, Jawa Timur</p>
        <p className="text-sm text-gray-600">Telp 6282336755212</p>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <h2 className="text-2xl font-bold mb-1">Surat Jalan</h2>
      <p className="text-sm text-gray-600">{document.surat_jalan_number}</p>
    </div>
  </header>
);

const ShippingInfo = ({ document }: { document: DeliveryDocument }) => (
  <section className="grid grid-cols-2 gap-4 my-4">
    <div className="border-2 border-gray-800 p-3 text-sm">
      <h3 className="font-bold mb-2">Ditujukan untuk:</h3>
      <p className="font-semibold">{document.customer_name}</p>
      <p>{document.shipping_address_default}</p>
      <p>Telp: {document.phone_number}</p>
    </div>
    <div className="border-2 border-gray-800 p-3 text-sm">
      <div className="space-y-1">
        <p>
          <span className="font-semibold">Tanggal:</span> {format(new Date(document.createdAt), 'dd MMMM yyyy', { locale: indonesiaLocale })}
        </p>
        <p>
          <span className="font-semibold">Metode Pengiriman:</span> {document.shipping_method}
        </p>
        <p>
          <span className="font-semibold">No. Resi:</span> {document.tracking_number}
        </p>
        <p>
          <span className="font-semibold">Nama Pengemudi:</span> {document.nama_pengemudi}
        </p>
        <p>
          <span className="font-semibold">No. Kendaraan:</span> {document.vehicle_number}
        </p>
      </div>
    </div>
  </section>
);

const ItemsTable = ({ items }: { items: any[] }) => (
  <table className="w-full border-collapse text-sm items-table">
    <thead>
      <tr className="bg-gray-700 text-white">
        <th className="border border-gray-400 p-2 text-center w-12">No</th>
        <th className="border border-gray-400 p-2 text-left">Nama Produk & Nomor Tabung</th>
        <th className="border border-gray-400 p-2 text-left w-36">Kode Produk</th>
        <th className="border border-gray-400 p-2 text-center w-20">Kuantitas</th>
        <th className="border border-gray-400 p-2 text-center w-16">Unit</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.no}>
          <td className="border border-gray-400 p-2 text-center align-top">{item.no}</td>
          <td className="border border-gray-400 p-2 align-top">
            <div className="font-semibold">{item.product_name}</div>
            {item.serial_numbers && item.serial_numbers.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                <span className="font-mono break-all">[{item.serial_numbers.join(', ')}]</span>
              </div>
            )}
          </td>
          <td className="border border-gray-400 p-2 text-center font-mono align-top">{item.product_code}</td>
          <td className="border border-gray-400 p-2 text-center align-top">{item.quantity}</td>
          <td className="border border-gray-400 p-2 text-center align-top">{item.unit}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const SignatureFooter = ({ document }: { document: DeliveryDocument }) => (
  <footer className="signatures mt-auto pt-8">
    <div className="grid grid-cols-2 gap-8">
      <div className="text-center">
        <p className="mb-16 text-sm">Diterima oleh, </p>
        <p className="font-bold">{document.customer_name} </p>
      </div>
      <div className="text-center">
        <p className="mb-16 text-sm">Dikirim oleh, </p>
        <p className="font-bold">CV KARYA AGUNG PRATAMA </p>
      </div>
    </div>
  </footer>
);

export default function DeliveryDocumentView({ initialDocument }: { initialDocument: DeliveryDocument }) {
  const router = useRouter();

  if (!initialDocument) {
    return (
      <PageTransition>
        <div className="container mx-auto p-6 max-w-4xl flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Surat Jalan tidak ditemukan</h2>
            <Button asChild>
              <Link href="/orders">Kembali ke Orders</Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  // --- LOGIKA PEMBAGIAN HALAMAN (PAGINATION) ---
  const allItems = initialDocument.items || [];
  const firstPageItems = allItems.slice(0, ITEMS_PER_FIRST_PAGE);
  const remainingItems = allItems.slice(ITEMS_PER_FIRST_PAGE);
  const subsequentPages = [];
  if (remainingItems.length > 0) {
    for (let i = 0; i < remainingItems.length; i += ITEMS_PER_SUBSEQUENT_PAGE) {
      subsequentPages.push(remainingItems.slice(i, i + ITEMS_PER_SUBSEQUENT_PAGE));
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <div className="print:hidden bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto p-4 max-w-4xl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Surat Jalan</h1>
                  <p className="text-sm text-muted-foreground">No: {initialDocument.surat_jalan_number}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto p-6 max-w-4xl print:p-0 print:max-w-none">
          <div className="print-container bg-white rounded-lg shadow-sm print:shadow-none print:rounded-none">
            {/* HALAMAN PERTAMA */}
            <div className="print-page">
              <div className="page-content">
                <DocumentHeader document={initialDocument} />
                <ShippingInfo document={initialDocument} />
                <main className="flex-grow">
                  <ItemsTable items={firstPageItems} />
                </main>
                {subsequentPages.length === 0 && <SignatureFooter document={initialDocument} />}
              </div>
            </div>

            {/* HALAMAN LANJUTAN (jika ada) */}
            {subsequentPages.map((pageItems, index) => (
              <div key={`page-${index}`} className="print-page">
                <div className="page-content">
                  <header className="pb-4">
                    <p className="text-right text-sm font-bold">Lanjutan Surat Jalan: {initialDocument.surat_jalan_number}</p>
                  </header>
                  <main className="flex-grow">
                    <ItemsTable items={pageItems} />
                  </main>
                  {index === subsequentPages.length - 1 && <SignatureFooter document={initialDocument} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CSS Global untuk Mengatur Tampilan Cetak --- */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          html,
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-page {
            page-break-after: always; /* Selalu coba buat halaman baru setelah ini */
            page-break-inside: avoid;
            width: 210mm;
            height: 297mm;
          }

          /* --- INI PERBAIKANNYA --- */
          /* Mencegah halaman kosong di akhir dengan menonaktifkan page break untuk elemen terakhir */
          .print-container > .print-page:last-child {
            page-break-after: auto;
          }
          /* --- AKHIR PERBAIKAN --- */

          .page-content {
            padding: 1.2cm 1.5cm;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          main {
            flex-grow: 1;
          }
          .items-table thead {
            display: table-header-group;
          }
          .items-table tbody tr,
          .signatures {
            page-break-inside: avoid;
          }
          .signatures {
            margin-top: auto;
          }
          .bg-gray-700 {
            background-color: #4a5568 !important;
            color: white !important;
          }
        }
      `}</style>
    </PageTransition>
  );
}
