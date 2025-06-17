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
    manage: 'gastype:manage',
  },
} as const;
