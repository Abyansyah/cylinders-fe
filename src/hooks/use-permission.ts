import { useAuthStore } from '@/stores/authStore';
import { useCallback } from 'react';

export function usePermission() {
  const { user } = useAuthStore();

  const checkPermission = useCallback(
    (requiredPermission?: string): boolean => {
      if (!requiredPermission) {
        return true;
      }

      if (!user?.role?.permissions) {
        return false;
      }

      if (user.role.role_name === 'Super Admin') {
        return true;
      }

      const userPermissions = user.role.permissions.map((p) => p.name);

      if (userPermissions.includes(requiredPermission)) {
        return true;
      }

      const [resource] = requiredPermission.split(':');
      const managePermission = `${resource}:manage`;
      if (userPermissions.includes(managePermission)) {
        return true;
      }

      return false;
    },
    [user] 
  );

  return { checkPermission, permissions: user?.role?.permissions || [] };
}
