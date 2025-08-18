// src/app/(dashboard)/refill-orders/components/confirm-dispatch-dialog.tsx

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

import { getDrivers } from '@/services/userService';
import { confirmDispatch } from '@/services/refillOrderService';
import type { RefillOrderDetail } from '@/types/refill-order';

const formSchema = z.object({
  vehicle_plate_number: z.string().min(1, 'Nomor plat kendaraan wajib diisi'),
  driver_user_id: z.number({ required_error: 'Driver wajib dipilih' }),
});

interface ConfirmDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: RefillOrderDetail;
}

export function ConfirmDispatchDialog({ open, onOpenChange, order }: ConfirmDispatchDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isMobile = useIsMobile();

  // FIX: Tambahkan defaultValues untuk menginisialisasi form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicle_plate_number: '',
      driver_user_id: undefined,
    },
  });

  const { data: driversResponse, isLoading: isLoadingDrivers } = useSWR('/users/drivers', getDrivers);
  const availableDrivers: any[] = driversResponse?.data || [];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await confirmDispatch(order.id, values);
      toast.success(`Order RO/2025/08/${order.id.toString().padStart(3, '0')} telah disetujui.`);
      mutate(`/refill-orders/${order.id}`); // Re-fetch data untuk halaman detail
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal menyetujui order. Coba lagi.');
      console.error('Error during confirmation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <Form {...form}>
      {/* Form dan JSX lainnya tetap sama */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground">Masukkan detail pengiriman untuk menyetujui order refill ini. Pastikan semua informasi sudah benar.</p>
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Supplier:</span>
            <span className="text-sm">{order.supplier.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Jumlah Tabung:</span>
            <span className="text-sm font-medium">{order.details.length} tabung</span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="vehicle_plate_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plat Nomor Kendaraan</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: B 1234 XYZ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="driver_user_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Pilih Driver</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}>
                      {field.value ? availableDrivers.find((driver) => driver.id === field.value)?.name : 'Pilih driver'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                  <Command>
                    <CommandInput placeholder="Cari driver..." />
                    <CommandList>
                      {isLoadingDrivers && <div className="p-4 text-sm">Memuat...</div>}
                      <CommandEmpty>Driver tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {availableDrivers.map((driver) => (
                          <CommandItem
                            value={driver.name}
                            key={driver.id}
                            onSelect={() => {
                              form.setValue('driver_user_id', driver.id);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4', driver.id === field.value ? 'opacity-100' : 'opacity-0')} />
                            {driver.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  const footer = (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
        Batal
      </Button>
      <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          'Setujui & Kirim'
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Konfirmasi Pengiriman</DrawerTitle>
            <DrawerDescription className="sr-only">Setujui Order</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pengiriman</DialogTitle>
          <DialogDescription className="sr-only">Setujui Order</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
