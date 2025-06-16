'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import type { Role } from '@/types/role';
import type { Permission } from '@/types/permission';
import { PageTransition } from '@/components/page-transition';
import { syncPermissionsAction } from '../../../actions/roleActions';

// Props yang diterima komponen dari Halaman Server
interface PermissionFormProps {
  initialRole: Role;
  allPermissions: Permission[];
}

// Tipe untuk data yang sudah dikelompokkan
type GroupedPermissions = Record<string, (Permission & { module: string; action: string })[]>;

// Styling warna untuk badge berdasarkan action
const actionColors: Record<string, string> = {
  create: 'border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-400',
  view: 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  update: 'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  delete: 'border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400',
  manage: 'border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  default: 'border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function PermissionForm({ initialRole, allPermissions }: PermissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Inisialisasi state dengan permission yang sudah dimiliki role dari server
  useEffect(() => {
    if (initialRole.permissions) {
      setSelectedIds(initialRole.permissions.map((p) => p.id));
    }
  }, [initialRole]);

  // Kelompokkan semua permission berdasarkan 'modul' untuk ditampilkan di UI
  const groupedPermissions = useMemo<GroupedPermissions>(() => {
    return allPermissions.reduce((acc, p) => {
      const [module, action = ''] = p.name.split(':');
      const formattedModule = module.replace('_', ' ');

      if (!acc[formattedModule]) {
        acc[formattedModule] = [];
      }
      acc[formattedModule].push({ ...p, module: formattedModule, action });
      return acc;
    }, {} as GroupedPermissions);
  }, [allPermissions]);

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedIds((prev) => (prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]));
  };

  const handleModuleToggle = (modulePermissions: Permission[]) => {
    const moduleIds = modulePermissions.map((p) => p.id);
    const allSelectedInModule = moduleIds.every((id) => selectedIds.includes(id));

    if (allSelectedInModule) {
      // Jika semua sudah terpilih, batalkan semua pilihan di modul ini
      setSelectedIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      // Jika belum semua terpilih, pilih semua di modul ini
      setSelectedIds((prev) => [...new Set([...prev, ...moduleIds])]);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await syncPermissionsAction(initialRole.id, selectedIds);
      if (result.success) {
        toast.success(result.message);
        router.push('/role');
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push('/role')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Manage Permissions: {initialRole.role_name}</h1>
          </div>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>Configure which permissions are assigned to this role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {Object.entries(groupedPermissions).map(([moduleName, permissions]) => {
                const allInModuleSelected = permissions.every((p) => selectedIds.includes(p.id));
                const someInModuleSelected = permissions.some((p) => selectedIds.includes(p.id));

                return (
                  <div key={moduleName} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`module-${moduleName}`}
                          checked={allInModuleSelected}
                          data-state={!allInModuleSelected && someInModuleSelected ? 'indeterminate' : allInModuleSelected ? 'checked' : 'unchecked'}
                          onCheckedChange={() => handleModuleToggle(permissions)}
                        />
                        <label htmlFor={`module-${moduleName}`} className="text-base font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {moduleName}
                        </label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {permissions.length} {permissions.length === 1 ? 'permission' : 'permissions'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${
                            selectedIds.includes(permission.id) ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          <Checkbox id={`permission-${permission.id}`} checked={selectedIds.includes(permission.id)} onCheckedChange={() => handlePermissionToggle(permission.id)} className="mt-1" />
                          <div className="space-y-1.5 flex-1">
                            <label htmlFor={`permission-${permission.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {permission.description || permission.action.replace('_', ' ')}
                            </label>
                            <p className="text-xs text-muted-foreground">{permission.name}</p>
                          </div>
                          <Badge className={`${actionColors[permission.action] || actionColors.default} capitalize overflow-hidden text-start`}>{permission.action.replace('_', ' ')}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
