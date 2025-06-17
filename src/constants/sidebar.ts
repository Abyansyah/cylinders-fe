import { Flame, LayoutDashboard, Users } from 'lucide-react';
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
    title: 'Gas Management',
    url: '/gas-type',
    id: 'gas-type',
    iconColor: 'text-orange-600',
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
    ],
  },
  {
    title: 'User Management',
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
