import { BrickWallFire, Building, CalendarSync, CircleGauge, FileText, Flame, IdCard, KeyRound, LayoutDashboard, Package, PackagePlus, ShoppingCart, TrendingUp, Truck, Users, UserSquare, Warehouse, Zap } from 'lucide-react';
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
    items: [
      {
        title: 'Product',
        url: '/products',
        id: 'product-list',
        icon: Flame,
        permissionKey: 'products',
      },
      {
        title: 'Tabung Gas',
        url: '/cylinders',
        id: 'cylinder-list',
        icon: Zap,
        permissionKey: 'cylinder',
      },
    ],
  },
  {
    title: 'Manajemen Tabung',
    url: '/replacement-barcode',
    icon: BrickWallFire,
    items: [
      {
        title: 'Customer Audit',
        url: '/customer-audit',
        id: 'customer-audit',
        icon: BrickWallFire,
        permissionKey: 'audit',
      },
      {
        title: 'Replacement Barcode',
        url: '/replacement-barcode',
        id: 'replacement-barcode',
        icon: PackagePlus,
        permissionKey: 'replacementBarcode',
      },
      {
        title: 'Alih Fungsi Gas',
        url: '/gas-conversions',
        id: 'gas-conversion',
        icon: CalendarSync,
        permissionKey: 'gasConversion',
      },
    ],
  },
  {
    title: 'Master Customer',
    icon: UserSquare,
    url: '/customers',
    items: [
      {
        title: 'Customer',
        url: '/customers',
        id: 'customer-list',
        icon: UserSquare,
        permissionKey: 'customer',
      },
      {
        title: 'Cabang Customer',
        url: '/branches',
        id: 'branch-list',
        icon: Building,
        permissionKey: 'branch',
      },
    ],
  },
  {
    title: 'Kartu Pinjaman',
    url: '/loan-adjustments',
    icon: TrendingUp,
    isActive: false,
    permissionKey: 'loanAdjustment',
    items: [
      {
        title: 'Update Pinjaman Relasi',
        url: '/loan-adjustments',
        id: 'loan-adjustment-list',
        icon: TrendingUp,
        permissionKey: 'loanAdjustment',
      },
      {
        title: 'Kartu Pinjaman Relasi',
        url: '/loan-card',
        id: 'loan-card-list',
        icon: IdCard,
        permissionKey: 'loanAdjustment',
      },
    ],
  },
  {
    title: 'Master Order',
    icon: ShoppingCart,
    isActive: false,
    url: '/orders',
    permissionKey: 'order',
    items: [
      {
        title: 'Buat Order',
        url: '/orders',
        id: 'order-list',
        icon: ShoppingCart,
        permissionKey: 'order',
      },
      {
        title: 'Refill Order',
        url: '/refill-orders',
        id: 'refill-order-list',
        icon: CircleGauge,
        permissionKey: 'refillOrder',
      },
    ],
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
    title: 'Update Status tabung',
    url: '/cylinder-status-update',
    icon: BrickWallFire,
    isActive: false,
    permissionKey: 'updateStatusTabung',
    onlyPermission: true,
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
    title: 'Penerimaan Masal Supplier',
    url: '/bulk-receive-supplier',
    icon: PackagePlus,
    isActive: false,
    permissionKey: 'refillOrderBulk',
  },
  {
    title: 'Manajemen Gudang',
    icon: Warehouse,
    id: 'warehouse',
    url: '/warehouses',
    permissionKey: 'warehouse',
  },
  {
    title: 'Master Vendor',
    icon: Building,
    id: 'supplier',
    url: '/suppliers',
    permissionKey: 'supplier',
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
        icon: Users,
        permissionKey: 'users',
      },
      {
        title: 'Roles',
        url: '/role',
        id: 'users-roles',
        icon: KeyRound,
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
        icon: FileText,
        permissionKey: 'laporanTTBK',
      },
      {
        title: 'Laporan Pengiriman',
        url: '/report-deliveries',
        id: 'delivery-report',
        icon: FileText,
        permissionKey: 'laporanTTBK',
      },
      {
        title: 'Laporan Stok Gudang',
        url: '/warehouse-stock-report',
        id: 'delivery-report',
        icon: FileText,
        permissionKey: 'laporanTTBK',
      },
      {
        title: 'Laporan Customer Audit',
        url: '/customer-audit-report',
        id: 'delivery-report',
        icon: FileText,
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
