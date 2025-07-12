import type { CylinderStatus } from '@/types/cylinder';

export const CYLINDER_STATUSES: CylinderStatus[] = [
  'Di Gudang - Kosong',
  'Di Gudang - Terisi',
  'Dialokasikan Untuk Order',
  'Siap Kirim',
  'Dalam Pengiriman',
  'Di Customer - Sewa',
  'Di Customer - Beli',
  'Dalam Perjalanan Kembali ke Gudang',
  'Perlu Inspeksi',
  'Rusak',
  'Tidak Aktif',
];

export const EDITABLE_STATUSES: CylinderStatus[] = ['Di Gudang - Kosong', 'Di Gudang - Terisi'];

export const STATUS_COLORS: Record<CylinderStatus, string> = {
  'Di Gudang - Kosong': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  'Di Gudang - Terisi': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Dialokasikan Untuk Order': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Siap Kirim': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Dalam Pengiriman': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Di Customer - Sewa': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Di Customer - Beli': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'Dalam Perjalanan Kembali ke Gudang': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Perlu Inspeksi': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Rusak: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'Tidak Aktif': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
};

export const getMovementTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    TERIMA_BARU: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    ISI_ULANG: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    PINDAH_GUDANG: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    KELUAR_PELANGGAN: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    DIALOKASIKAN_KE_ORDER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    KELUAR_UNTUK_PENGIRIMAN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    DISERAHKAN_KE_CUSTOMER: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    DIAMBIL_DARI_CUSTOMER: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    DITERIMA_DI_GUDANG: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    KEMBALI_PELANGGAN: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
    UPDATE_STATUS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

export const getMovementTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    TERIMA_BARU: 'Penerimaan Baru',
    ISI_ULANG: 'Pengisian Ulang',
    PINDAH_GUDANG: 'Pindah Gudang',
    KELUAR_PELANGGAN: 'Keluar ke Pelanggan',
    DIALOKASIKAN_KE_ORDER: 'Dialokasikan ke Order',
    KELUAR_UNTUK_PENGIRIMAN: 'Keluar untuk Pengiriman',
    DISERAHKAN_KE_CUSTOMER: 'Diserahkan ke Customer',
    DIAMBIL_DARI_CUSTOMER: 'Diambil dari Customer',
    DITERIMA_DI_GUDANG: 'Diterima di Gudang',
    KEMBALI_PELANGGAN: 'Kembali dari Pelanggan',
    UPDATE_STATUS: 'Perubahan Status',
  };
  return labels[type] || type;
};
