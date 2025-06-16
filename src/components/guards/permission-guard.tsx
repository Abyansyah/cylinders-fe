'use client';

import { useAuthStore } from '@/stores/authStore';
import { usePermission } from '@/hooks/use-permission';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
}

export function PermissionGuard({ children, requiredPermission }: PermissionGuardProps) {
  const { authStatus } = useAuthStore();
  const { checkPermission } = usePermission();

  if (authStatus === 'loading') {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const hasAccess = checkPermission(requiredPermission);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-4xl font-bold">Akses Ditolak</h1>
      <p className="mt-2 text-muted-foreground">Anda tidak memiliki izin untuk melihat halaman ini.</p>
    </div>
  );
}
