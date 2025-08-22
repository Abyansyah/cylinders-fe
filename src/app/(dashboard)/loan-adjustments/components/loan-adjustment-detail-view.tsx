'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Plus, Minus, Calendar, User, Building2, FileText } from 'lucide-react';
import type { LoanAdjustmentDetail } from '@/types/loan-adjustment';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { getLoanAdjustmentById } from '@/services/loanAdjustmentService';
import { Separator } from '@radix-ui/react-separator';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LoanAdjustmentDetailView({ initialAdjustment }: { initialAdjustment: LoanAdjustmentDetail }) {
  const router = useRouter();
  const { data: adjustment, isLoading } = useSWR(`/loans/adjustments/${initialAdjustment.id}`, () => getLoanAdjustmentById(initialAdjustment.id), {
    fallbackData: initialAdjustment,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!adjustment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Adjustment Not Found</h2>
          <p className="text-muted-foreground">The requested loan adjustment could not be found.</p>
        </div>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const isAddition = adjustment.adjustment_type === 'ADDITION';

  return (
    <motion.div className="space-y-6 p-4 md:p-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Alih Fungsi Gas Detail</h1>
          </div>
          <p className="text-muted-foreground">Detail penyesuaian pinjaman #{adjustment.adjustment_number}</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <Card className={`border-l-4 ${isAddition ? 'border-l-green-500' : 'border-l-red-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isAddition ? <Plus className="h-5 w-5 text-green-600" /> : <Minus className="h-5 w-5 text-red-600" />}
                Basic Information
              </CardTitle>
              <CardDescription>Informasi dasar penyesuaian pinjaman</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Adjustment Number</label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-blue-600 font-medium">{adjustment.adjustment_number}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Adjustment Type</label>
                  <Badge variant="secondary" className={`${isAddition ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center gap-1 w-fit`}>
                    {isAddition ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {isAddition ? 'Addition' : 'Removal'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Adjustment Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(adjustment.adjustment_date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{adjustment.createdBy.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Customer Information
              </CardTitle>
              <CardDescription>Informasi customer yang terkait dengan penyesuaian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{adjustment.customer.customer_name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{adjustment.customer.company_name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Notes
              </CardTitle>
              <CardDescription>Catatan tambahan untuk penyesuaian ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed">{adjustment.notes}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item} className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Summary
              </CardTitle>
              <CardDescription>Ringkasan penyesuaian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Completed
                  </Badge>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="secondary" className={`${isAddition ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isAddition ? 'Addition' : 'Removal'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer</span>
                  <span className="text-sm font-medium text-right">{adjustment.customer.customer_name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium">{new Date(adjustment.adjustment_date).toLocaleDateString('id-ID')}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created By</span>
                  <span className="text-sm font-medium text-right">{adjustment.createdBy.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
