'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Table, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { getMovementTypeLabel } from '@/constants/cylinder';

interface StockMovement {
  id: number;
  movement_type: string;
  notes: string;
  timestamp: string;
  user: {
    name: string;
    username: string;
  };
  fromWarehouse?: {
    name: string;
  } | null;
  toWarehouse?: {
    name: string;
  } | null;
}

interface MovementHistoryExportProps {
  movements: StockMovement[];
  cylinderBarcode: string;
}

export function MovementHistoryExport({ movements, cylinderBarcode }: MovementHistoryExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('RIWAYAT PERGERAKAN TABUNG GAS', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Barcode: ${cylinderBarcode}`, 20, 35);
      doc.text(`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`, 20, 45);
      doc.text(`Total Pergerakan: ${movements.length} aktivitas`, 20, 55);

      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      const tableData = movements.map((movement, index) => [
        (index + 1).toString(),
        format(new Date(movement.timestamp), 'dd/MM/yyyy HH:mm', { locale: id }),
        getMovementTypeLabel(movement.movement_type),
        movement.notes,
        movement.user.name,
        movement.fromWarehouse?.name || '-',
        movement.toWarehouse?.name || '-',
      ]);

      autoTable(doc, {
        head: [['No', 'Tanggal', 'Jenis', 'Keterangan', 'User', 'Dari', 'Ke']],
        body: tableData,
        startY: 75,
        margin: { left: 20, right: 20 }, 
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: 'center' },
          3: { cellWidth: 'auto' }, 
        },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Halaman ${i} dari ${pageCount} | Dicetak pada ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`, 105, 285, { align: 'center' });
      }

      doc.save(`Riwayat_Pergerakan_${cylinderBarcode}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      const excelData = [
        ['RIWAYAT PERGERAKAN TABUNG GAS'],
        [`Barcode: ${cylinderBarcode}`],
        [`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })}`],
        [`Total Pergerakan: ${movements.length} aktivitas`],
        [], 
        ['No', 'Tanggal', 'Jenis Pergerakan', 'Keterangan', 'User', 'Gudang Asal', 'Gudang Tujuan'],
        ...movements.map((movement, index) => [
          index + 1,
          format(new Date(movement.timestamp), 'dd/MM/yyyy HH:mm', { locale: id }),
          getMovementTypeLabel(movement.movement_type),
          movement.notes,
          movement.user.name,
          movement.fromWarehouse?.name || '-',
          movement.toWarehouse?.name || '-',
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 5 }, // No
        { wch: 18 }, // Tanggal
        { wch: 25 }, // Jenis
        { wch: 50 }, // Keterangan
        { wch: 20 }, // User
        { wch: 25 }, // Dari
        { wch: 25 }, // Ke
      ];

      // Style header
      const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: '3B82F6' } },
          color: { rgb: 'FFFFFF' },
        };
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Pergerakan');
      XLSX.writeFile(workbook, `Riwayat_Pergerakan_${cylinderBarcode}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          {isExporting ? 'Mengunduh...' : 'Unduh Riwayat'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Unduh PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="mr-2 h-4 w-4" />
          Unduh Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
