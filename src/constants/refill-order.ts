/**
 * @param status Status pesanan.
 * @returns String kelas CSS.
 */
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_TRANSIT_TO_SUPPLIER':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'PARTIALLY_RECEIVED':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * @param status Status pesanan.
 * @returns String label status.
 */
export const getStatusLabel = (status: string) => {
  const labels: { [key: string]: string } = {
    PENDING_CONFIRMATION: 'Menunggu Konfirmasi',
    CONFIRMED: 'Dikonfirmasi',
    IN_TRANSIT_TO_SUPPLIER: 'Dalam Perjalanan',
    PARTIALLY_RECEIVED: 'Diterima Sebagian',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
};
