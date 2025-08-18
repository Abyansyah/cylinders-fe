'use client';

import { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { getRefillOrderById, getRefillOrderDeliveryNote } from '@/services/refillOrderService';
import Image from 'next/image';

export default function DeliveryNoteView() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id as string);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: order } = useSWR(orderId ? `/refill-orders/${orderId}` : null, () => getRefillOrderById(orderId));

  const systemNumber = order?.systemNumber;
  const { data: deliveryNote, error, isLoading } = useSWR(systemNumber ? `/refill-orders/refill/${systemNumber}` : null, () => getRefillOrderDeliveryNote(systemNumber!));

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Surat-Jalan-${deliveryNote?.header?.sj_number?.replace(/\//g, '-')}`,
    pageStyle: `
      @page {
        size: A5 landscape;
        margin: 10mm;
      }
      @media print {
        body { margin: 0; }
        .page-break { page-break-before: always; }
      }
    `,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  if (isLoading || !deliveryNote) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat data surat jalan...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8">Gagal memuat data atau data tidak ditemukan.</div>;
  }

  const { header, items } = deliveryNote;

  return (
    <>
      <div className=" p-4 sm:p-8 print:hidden">
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-lg font-semibold">Surat Jalan: {header.sj_number}</h1>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>

      {/* Surat Jalan Content */}
      <div className="flex justify-center p-6 space-y-6 print:p-0">
        <div
          ref={printRef}
          className="bg-white p-6"
          style={{
            fontFamily: 'Arial, sans-serif',
            width: '210mm', // A5 landscape width
            minHeight: '148mm', // A5 landscape height
          }}
        >
          {/* Page 1 */}
          <div className="page-content">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 relative">
                  <div className="w-full h-full rounded-sm flex items-center justify-center">
                    <div className="text-white font-bold text-sm">
                      <div className="flex flex-col items-center leading-none">
                        <Image src="/logo-KAP.png" alt="Logo" width={40} height={40} className="w-80" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-800 mb-1">CV KARYA AGUNG PRATAMA</h1>
                  <p className="text-xs text-gray-700 leading-tight">Desa Hulaan RT.010 RW.005 Hulaan, Menganti</p>
                  <p className="text-xs text-gray-700 leading-tight">Kab. Gresik - Jawa Timur 61174</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800 tracking-wide">SURAT JALAN</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-4">
              <div className="space-y-1 text-xs">
                <div className="flex">
                  <span className="w-18 text-gray-700">Nomor SJ</span>
                  <span className="mr-2">:</span>
                  <span className="font-medium">{header.sj_number}</span>
                </div>
                <div className="flex">
                  <span className="w-18 text-gray-700">Tanggal</span>
                  <span className="mr-2">:</span>
                  <span className="font-medium">{formatDate(header.date)}</span>
                </div>
                <div className="flex">
                  <span className="w-18 text-gray-700">No. Polisi</span>
                  <span className="mr-2">:</span>
                  <span className="font-medium">{header.vehicle_number || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-18 text-gray-700">Driver</span>
                  <span className="mr-2">:</span>
                  <span className="font-medium">{header.driver_name || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-18 text-gray-700">No. Sistem</span>
                  <span className="mr-2">:</span>
                  <span className="font-medium">{header.system_number}</span>
                </div>
              </div>

              <div className="text-xs">
                <div className="mb-1">
                  <span className="font-medium text-gray-700">Dikirim ke :</span>
                </div>
                <div className="font-bold text-gray-900 text-sm">{header.supplier.name.toUpperCase()}</div>
                <div className="text-gray-700 text-xs">{header.supplier.address}</div>
              </div>
            </div>

            <div className="border-l-2 border-r-2 border-gray-900 mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-t-2 border-b-2 border-gray-900">
                    <th className="p-2 text-center font-bold text-xs w-12 bg-gray-100">No.</th>
                    <th className="p-2 text-center font-bold text-xs bg-gray-100">Nama Barang</th>
                    <th className="p-2 text-center font-bold text-xs w-16 bg-gray-100">Satuan</th>
                    <th className="p-2 text-center font-bold text-xs w-16 bg-gray-100">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {items.slice(0, 2).map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 text-center font-bold text-xs">{index + 1}</td>
                      <td className="p-2">
                        <div className="font-bold text-xs mb-1">{item.item_name}</div>
                        <div className="text-xs space-x-3 leading-relaxed">
                          {item.serial_numbers.map((serial, idx) => (
                            <span key={idx} className="font-mono inline-block">
                              {serial}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2 text-center font-bold text-xs">{item.unit}</td>
                      <td className="p-2 text-center font-bold text-sm">{item.quantity}</td>
                    </tr>
                  ))}

                  {items.length > 2 &&
                    items.slice(2).map((item, index) => (
                      <tr key={index + 2}>
                        <td className="p-2 text-center font-bold text-xs">{index + 3}</td>
                        <td className="p-2">
                          <div className="font-bold text-xs mb-1">{item.item_name}</div>
                          <div className="text-xs space-x-3 leading-relaxed">
                            {item.serial_numbers.map((serial, idx) => (
                              <span key={idx} className="font-mono inline-block">
                                {serial}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 text-center font-bold text-xs">{item.unit}</td>
                        <td className="p-2 text-center font-bold text-sm">{item.quantity}</td>
                      </tr>
                    ))}

                  {/* Fill empty rows only if we have less than 2 items */}
                  {items.length < 2 &&
                    Array.from({ length: 2 - items.length }).map((_, index) => (
                      <tr key={`empty-${index}`}>
                        <td className="p-2 h-12 text-center">&nbsp;</td>
                        <td className="p-2">&nbsp;</td>
                        <td className="p-2 text-center">&nbsp;</td>
                        <td className="p-2 text-center">&nbsp;</td>
                      </tr>
                    ))}

                  {/* Notes Row */}
                  <tr className="border-y-2 border-gray-900">
                    <td colSpan={4} className="p-2">
                      <div className="font-bold text-xs">KETERANGAN :</div>
                      <div className="text-xs mt-1">U/ DIISIKAN</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures section */}
            <div className="signatures-section">
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <p className="mb-12 text-xs font-medium">Diterima oleh,</p>
                  <div className="mb-2">
                    <div className="h-8"></div>
                    <p className="text-xs text-gray-600">(.......................)</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">Asli (putih): Administrasi Gudang</p>
                </div>

                <div className="text-center">
                  <p className="mb-12 text-xs font-medium">Pengangkut,</p>
                  <div className="mb-2">
                    <div className="h-8"></div>
                    <p className="text-xs text-gray-600">(.......................)</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="mb-12 text-xs font-medium">Hormat kami,</p>
                  <div className="mb-2">
                    <div className="h-8"></div>
                    <p className="text-xs text-gray-600">(.......................)</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">Tembusan (Merah) : Pelanggan/Supplier </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
