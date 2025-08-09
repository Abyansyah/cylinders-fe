'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import type { Role } from '@/types/role';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';

export const getColumns = (onDelete: (role: Role) => void): ColumnDef<Role>[] => [
  {
    accessorKey: 'role_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role Name" />,
  },
  {
    accessorKey: 'permission_count',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Permissions" />,
    cell: ({ row }) => {
      const count = row.getValue('permission_count') as string;
      return <div>{count} permissions</div>;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
    cell: ({ row }) => {
      const updatedAt = row.getValue('updatedAt') as string;
      return <div>{new Date(updatedAt).toLocaleDateString('id-ID')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original;
      const { checkPermission } = usePermission();
      const canManagePermissions = checkPermission(PERMISSIONS.roles.update);
      const canEdit = checkPermission(PERMISSIONS.roles.update);
      const canDelete = checkPermission(PERMISSIONS.roles.delete);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {canEdit && (
              <DropdownMenuItem asChild>
                <Link href={`/role/${role.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Role
                </Link>
              </DropdownMenuItem>
            )}
            {canManagePermissions && (
              <DropdownMenuItem asChild>
                <Link href={`/role/${role.id}/permissions`}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Manage Permissions
                </Link>
              </DropdownMenuItem>
            )}
            {/* {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(role)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )} */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
