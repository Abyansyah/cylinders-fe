'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ExportAuditReportProps {
  auditId: number;
}

export function ExportAuditReport({ auditId }: ExportAuditReportProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useIsMobile() === false;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const pdfUrl = `${apiBaseUrl}/reports/audits/${auditId}/export?format=pdf`;
  const excelUrl = `${apiBaseUrl}/reports/audits/${auditId}/export?format=excel`;

  if (isDesktop) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Laporan
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={excelUrl} target="_blank" rel="noopener noreferrer">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Export Laporan
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Export Laporan</DrawerTitle>
          <DrawerDescription>Pilih format laporan yang ingin Anda unduh.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <Link href={excelUrl} target="_blank" rel="noopener noreferrer">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </Link>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
