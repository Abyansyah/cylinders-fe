import { BrickWallFire, Building, ClipboardCheck, FileText, Flame, GitBranch, LayoutDashboard, Package, QrCode, Repeat, ShoppingCart, TrendingUp, Truck, Users, UserSquare, Warehouse, Zap } from 'lucide-react';
import type { SidebarItem } from '@/types/sidebar';

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    isActive: true,
    permissionKey: 'dashboard',
  },
  {
    title: 'Master Product',
    url: '/products',
    id: 'gas-type',
    icon: Flame,
    permissionKey: 'products',
  },
  {
    id: 'orders',
    title: 'Buat Order',
    icon: ShoppingCart,
    isActive: false,
    url: '/orders',
    permissionKey: 'order',
  },
  {
    title: 'Menyiapkan Tabung',
    url: '/warehouse-prepare',
    icon: Warehouse,
    isActive: false,
    permissionKey: 'warehousePrepare',
    onlyPermission: true,
  },
  {
    title: 'Pengiriman Saya',
    url: '/driver-deliveries',
    icon: Truck,
    isActive: false,
    permissionKey: 'driverDelivery',
    onlyPermission: true,
  },
  {
    title: 'TTBK',
    url: '/ttbk',
    icon: Package,
    isActive: false,
    permissionKey: 'returnreceipt',
    onlyPermission: true,
  },
  {
    title: 'Penerimaan TTBK',
    url: '/warehouse-receipt',
    icon: FileText,
    isActive: false,
    permissionKey: 'penerimaanTTBK',
    onlyPermission: true,
  },
  {
    title: 'Tabung Gas',
    url: '/cylinders',
    icon: BrickWallFire,
    isActive: false,
    permissionKey: 'cylinder',
  },
  {
    title: 'Customer Audit',
    url: '/customer-audit',
    icon: ClipboardCheck,
    isActive: false,
    permissionKey: 'audit',
  },
  {
    title: 'Replacement Barcode',
    url: '/replacement-barcode',
    icon: QrCode,
    isActive: false,
    permissionKey: 'replacementBarcode',
  },
  {
    title: 'Update Status tabung',
    url: '/cylinder-status-update',
    icon: BrickWallFire,
    isActive: false,
    permissionKey: 'updateStatusTabung',
    onlyPermission: true,
  },
  {
    title: 'Alih Fungsi Gas',
    url: '/gas-conversions',
    icon: Zap,
    isActive: false,
    permissionKey: 'gasConversion',
  },
  {
    title: 'Permintaan Alih Fungsi Gas',
    url: '/gas-conversions/warehouse',
    icon: Zap,
    isActive: false,
    permissionKey: 'gasConversionWarehouse',
    onlyPermission: true,
  },
  {
    title: 'Update Pinjaman Relasi',
    url: '/loan-adjustments',
    icon: TrendingUp,
    isActive: false,
    permissionKey: 'loanAdjustment',
  },
  {
    title: 'Refill Order',
    url: '/refill-orders',
    icon: Repeat,
    isActive: false,
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
    title: 'Supplier',
    icon: Building,
    id: 'supplier',
    url: '/suppliers',
    permissionKey: 'warehouse',
  },
  {
    title: 'Manajemen Pengguna',
    url: '/users',
    icon: Users,
    id: 'users',
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
  {
    title: 'Laporan',
    url: '/manage-ttbk',
    icon: FileText,
    isActive: false,
    items: [
      {
        title: 'Laporan TTBK',
        url: '/manage-ttbk',
        id: 'manage-ttbk',
        permissionKey: 'laporanTTBK',
      },
      {
        title: 'Laporan Pengiriman',
        url: '/report-deliveries',
        id: 'delivery-report',
        permissionKey: 'laporanTTBK',
      },
      {
        title: 'Laporan Stok Gudang',
        url: '/warehouse-stock-report',
        id: 'delivery-report',
        permissionKey: 'laporanTTBK',
      },
      {
        title: 'Laporan Customer Audit',
        url: '/customer-audit-report',
        id: 'delivery-report',
        permissionKey: 'laporanTTBK',
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
