import { BrickWallFire, Flame, GitBranch, LayoutDashboard, ShoppingCart, Users, UserSquare, Warehouse } from 'lucide-react';
import type { SidebarItem } from '@/types/sidebar';

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    isActive: true,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    items: [
      {
        title: 'Console',
        url: '/',
        id: 'console',
      },
    ],
  },
  {
    title: 'Manajemen Gas',
    url: '/gas-type',
    id: 'gas-type',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: Flame,
    items: [
      {
        title: 'Tipe Gas',
        url: '/gas-type',
        id: 'gas-type-list',
        permissionKey: 'gasType',
      },
      {
        title: 'Tabung',
        url: '/cylinder-properties',
        id: 'gas-type-cylinder-properties',
        permissionKey: 'cylinderProperty',
      },
      {
        title: 'Produk',
        url: '/products',
        id: 'gas-type-products',
        permissionKey: 'products',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Buar Order',
    icon: ShoppingCart,
    isActive: false,
    url: '/orders',
  },
  {
    title: 'Tabung Gas',
    url: '/cylinders',
    icon: BrickWallFire,
  },
  {
    title: 'Cabang',
    icon: GitBranch,
    url: '/branches',
    permissionKey: 'branch',
  },
  {
    title: 'Manajemen Gudang',
    icon: Warehouse,
    id: 'warehouse',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    url: '/warehouses',
    permissionKey: 'warehouse',
  },
  {
    title: 'Pelanggan',
    icon: UserSquare,
    url: '/customers',
    permissionKey: 'customer',
  },
  {
    title: 'Manajemen Pengguna',
    url: '/users',
    icon: Users,
    id: 'users',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    items: [
      {
        title: 'Users',
        url: '/users',
        id: 'users-list',
        permissionKey: 'users',
      },
      {
        title: 'Roles',
        url: '/role',
        id: 'users-roles',
        permissionKey: 'roles',
      },
    ],
  },
];

export const SIDEBAR_COOKIE_NAME = 'sidebar:state';
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
export const SIDEBAR_WIDTH = '16rem';
export const SIDEBAR_WIDTH_MOBILE = '18rem';
export const SIDEBAR_WIDTH_ICON = '3rem';
export const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
