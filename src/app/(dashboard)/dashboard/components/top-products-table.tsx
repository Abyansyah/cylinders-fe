'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TopProduct } from '@/types/dashboard';
import { Package } from 'lucide-react';

interface TopProductsTableProps {
  data: TopProduct[];
}

export function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terpopuler</CardTitle>
        <CardDescription>Produk yang paling sering dipesan dalam 30 hari terakhir.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Peringkat</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead className="text-right">Jumlah Pesanan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product, index) => (
              <TableRow key={product.product_name}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{product.product_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">{product.order_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
