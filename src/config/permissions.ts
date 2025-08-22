export const PERMISSIONS = {
  dashboard: {
    view: 'dashboard:view',
  },
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
    create: 'returnreceipt:create',
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
  loanAdjustment: {
    view: 'loan_adjustment:view_all',
    view_detail: 'loan_adjustment:view_detail',
    create: 'loan_adjustment:add',
    delete: 'loan_adjustment:remove',
    transfer: 'loan_adjustment:transfer',
  },
  reportDelivery: {
    view: 'report:view_deliveries',
  },
  reportStockWarehouse: {
    view: 'report:view_warehouse_stock',
  },
  audit: {
    view_all: 'audit:view_all',
    create: 'audit:create',
  },
  gasConversion: {
    view_all: 'gas_conversion:view_all',
    approve: 'gas_conversion:approve',
    reassign_warehouse: 'gas_conversion:reassign',
    create: 'gas_conversion:create',
  },
  gasConversionWarehouse: {
    view_all: 'gas_conversion:execute',
  },
  updateStatusTabung: {
    view: 'cylinder:bulk_update_status',
  },
  importDataCustomer: {
    view: 'customer:import',
  },
  importDataCylinder: {
    view: 'cylinder:import',
  },
  refillOrder: {
    view_all: 'refill_order:view_all_refill_orders',
    view: 'refill_order:view_own_refill_orders',
    view_detail: 'refill_order:view_refill_order_details',
    create: 'refill_order:create_refill_order',
    recieve: 'refill_order:receive_refill_order',
    approve: 'refill_order:confirm_refill_order',
  },
  supplier: {
    view: 'supplier:view',
    manage: 'supplier:manage',
  },
} as const;
