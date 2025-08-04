'use client';

import type React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building2, Users, FileText, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageTransition } from '@/components/page-transition';
import type { CreateAuditData } from '@/types/customer-audit';
import { toast } from 'sonner';
import useSWR from 'swr';
import { getCustomers } from '@/services/customerService';
import { getBranches } from '@/services/branchService';
import { createAudit } from '@/services/auditService';
import { useDebounce } from '@/hooks/use-debounce';

export default function CreateAuditForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [openCustomer, setOpenCustomer] = useState(false);
  const [openBranch, setOpenBranch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [branchSearch, setBranchSearch] = useState('');

  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const debouncedBranchSearch = useDebounce(branchSearch, 300);

  const [formData, setFormData] = useState<CreateAuditData>({
    customer_id: 0,
    branch_id: 0,
    notes: '',
  });

  const { data: customersResponse } = useSWR(`/customers?search=${debouncedCustomerSearch}`, () => getCustomers({ search: debouncedCustomerSearch }));
  const { data: branchesResponse } = useSWR(`/branches?search=${debouncedBranchSearch}`, () => getBranches({ search: debouncedBranchSearch }));

  const customers = customersResponse?.data || [];
  const branches = branchesResponse?.data || [];

  const selectedCustomer = customers.find((c) => c.id === formData.customer_id);
  const selectedBranch = branches.find((b) => b.id === formData.branch_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.branch_id) {
      toast.error('Error', {
        description: 'Customer dan Cabang harus dipilih',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await createAudit(formData);
      const auditId = response.audit_details.id;

      toast.success('Berhasil', {
        description: 'Audit berhasil dibuat. Redirecting ke halaman scan...',
      });

      setTimeout(() => {
        router.push(`/customer-audit/${auditId}/scan`);
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error('Error', {
        description: error.response?.data?.message || 'Gagal membuat audit. Silakan coba lagi.',
      });
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customerId: number) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: customerId,
      branch_id: 0,
    }));
    setOpenCustomer(false);
  };

  const handleBranchSelect = (branchId: number) => {
    setFormData((prev) => ({
      ...prev,
      branch_id: branchId,
    }));
    setOpenBranch(false);
  };

  return (
    <PageTransition>
      <div className="flex-1 space-y-6 pt-2 md:pt-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Buat Audit Baru</h1>
              <p className="text-muted-foreground">Buat audit customer untuk inventory tabung gas</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Form Audit
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Customer *</Label>
                    <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openCustomer} className="w-full justify-between bg-transparent">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {selectedCustomer ? selectedCustomer.customer_name : 'Pilih Customer...'}
                          </div>
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cari customer..." onValueChange={setCustomerSearch} />
                          <CommandEmpty>Customer tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {customers.map((customer) => (
                                <CommandItem key={customer.id} value={customer.customer_name} onSelect={() => handleCustomerSelect(customer.id)}>
                                  <Building2 className="mr-2 h-4 w-4" />
                                  {customer.customer_name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Cabang *</Label>
                    <Popover open={openBranch} onOpenChange={setOpenBranch}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={openBranch} className="w-full justify-between bg-transparent" disabled={!formData.customer_id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {selectedBranch ? selectedBranch.name : 'Pilih Cabang...'}
                          </div>
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cari cabang..." onValueChange={setBranchSearch} />
                          <CommandEmpty>Cabang tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {branches.map((branch) => (
                                <CommandItem key={branch.id} value={branch.name} onSelect={() => handleBranchSelect(branch.id)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  {branch.name}
                                </CommandItem>
                              ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea placeholder="Masukkan catatan tambahan untuk audit ini..." value={formData.notes} onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))} rows={4} />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Batal
                  </Button>
                  <Button type="submit" disabled={isLoading || !formData.customer_id || !formData.branch_id} className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Membuat...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Buat Audit
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
