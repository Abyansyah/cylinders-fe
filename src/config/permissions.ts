export const PERMISSIONS = {
  users: {
    view: 'user:view_all',
    create: 'user:create',
    update: 'user:update',
    delete: 'user:delete',
    manage_roles: 'user:manage_roles',
  },
  roles: {
    view: 'role:view_all',
    create: 'role:create',
    update: 'role:update',
    delete: 'role:delete',
  },
  gasType: {
    view: 'gastype:manage',
  },
  cylinderProperty: {
    view: 'cylinderproperty:manage',
  },
  products: {
    view: 'product:manage',
  },
  warehouse: {
    view: 'warehouse:view_all',
    create: 'warehouse:create',
    update: 'warehouse:update',
    delete: 'warehouse:delete',
  },
  customer: {
    view_all: 'customer:view_all',
    view: 'customer:view',
    create: 'customer:create',
    update: 'customer:update',
    delete: 'customer:delete',
  },
  branch: {
    view: 'branch:manage',
    create: 'branch:manage',
    update: 'branch:manage',
    delete: 'branch:manage',
  },
  cylinder: {
    view: 'cylinder:view_all',
    create: 'cylinder:create',
    update: 'cylinder:update_status',
  },
  warehousePrepare: {
    view: 'warehouse:view_orders_to_prepare',
  },
  order: {
    view: 'order:view_all',
    create: 'order:create',
    update: 'order:update',
    cancel: 'order:cancel',
  },
  driverDelivery: {
    view: 'delivery:view_own_active',
  },
  returnreceipt: {
    view: 'returnreceipt:view_own',
    view_detail: 'returnreceipt:view_detail',
    view_all: 'returnreceipt:view_all',
  },
  laporanTTBK: {
    view: 'returnreceipt:view_all',
  },
  penerimaanTTBK: {
    view: 'returnreceipt:view_incoming',
  },
  replacementBarcode: {
    view: 'replacementbarcode:can_replace',
  },
} as const;
