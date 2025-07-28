'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import Link from 'next/link';

interface MovementHistoryExportProps {
  cylinderId: number;
}

export function MovementHistoryExport({ cylinderId }: MovementHistoryExportProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const pdfUrl = `${apiBaseUrl}/cylinders/export-history/${cylinderId}?format=pdf`;
  const excelUrl = `${apiBaseUrl}/cylinders/export-history/${cylinderId}?format=excel`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Unduh Riwayat
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="mr-2 h-4 w-4" />
            Unduh PDF
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={excelUrl} target="_blank" rel="noopener noreferrer">
            <Table className="mr-2 h-4 w-4" />
            Unduh Excel
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
