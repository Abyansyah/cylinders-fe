'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRoles, getWarehouses } from '@/services/userService';
import { createUserAction, updateUserAction, type FormState } from '../actions/userActions';
import type { ApiUser } from '@/types/user';
import type { Role } from '@/types/role';
import type { Warehouse } from '@/types/warehouse';
import { Textarea } from '@/components/ui/textarea';

interface UserFormProps {
  initialData?: ApiUser | null;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEdit ? 'Updating...' : 'Creating...'}
        </>
      ) : isEdit ? (
        'Update User'
      ) : (
        'Create User'
      )}
    </Button>
  );
}

export function UserForm({ initialData }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(initialData?.role.id.toString());

  const action = isEdit ? updateUserAction.bind(null, initialData.id) : createUserAction;
  const initialState: FormState = { message: '', success: false, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  const { data: roles, error: rolesError } = useSWR<Role[]>('/roles', getRoles);
  const { data: warehouses, error: warehousesError } = useSWR<Warehouse[]>(selectedRoleId === '4' ? '/warehouses' : null, getWarehouses);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || (isEdit ? 'User updated successfully!' : 'User created successfully!'));
      router.push('/users');
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, isEdit, router]);

  const getError = (field: string) => state.errors?.[field]?.[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/users')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEdit ? 'User Details' : 'Create User'}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit User' : 'Create a New User'}</CardTitle>
          <CardDescription>{isEdit ? `Editing the profile for ${initialData.name}` : 'Fill in the details below to add a new user.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={initialData?.name} placeholder="e.g. John Doe" required />
                {getError('name') && <p className="text-sm text-red-500">{getError('name')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={initialData?.email} placeholder="e.g. john.doe@example.com" required />
                {getError('email') && <p className="text-sm text-red-500">{getError('email')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" name="phone_number" defaultValue={initialData?.phone_number} placeholder="e.g. 081234567890" required />
                {getError('phone_number') && <p className="text-sm text-red-500">{getError('phone_number')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role_id">Role</Label>
                <Select name="role_id" defaultValue={initialData?.role.id.toString()} onValueChange={setSelectedRoleId} required>
                  <SelectTrigger id="role_id">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesError && (
                      <SelectItem value="error" disabled>
                        Failed to load roles
                      </SelectItem>
                    )}
                    {!roles && !rolesError && (
                      <SelectItem value="loading" disabled>
                        Loading roles...
                      </SelectItem>
                    )}
                    {roles
                      ?.filter((role) => role.role_name.toLowerCase() !== 'customer')
                      .map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {getError('role_id') && <p className="text-sm text-red-500">{getError('role_id')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={initialData?.username} placeholder="e.g. johndoe" required />
                {getError('username') && <p className="text-sm text-red-500">{getError('username')}</p>}
              </div>

              {selectedRoleId === '4' && (
                <div className="space-y-2">
                  <Label htmlFor="warehouse_id">Warehouse</Label>
                  <Select name="warehouse_id" defaultValue={initialData?.warehouse ? initialData.warehouse.id.toString() : ''} required>
                    <SelectTrigger id="warehouse_id">
                      <SelectValue placeholder="Select a warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehousesError && (
                        <SelectItem value="error" disabled>
                          Failed to load warehouses
                        </SelectItem>
                      )}
                      {!warehouses && !warehousesError && (
                        <SelectItem value="loading" disabled>
                          Loading warehouses...
                        </SelectItem>
                      )}
                      {warehouses?.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getError('warehouse_id') && <p className="text-sm text-red-500">{getError('warehouse_id')}</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder={isEdit ? 'Leave blank to keep current password' : '••••••••'} />
                {getError('password') && <p className="text-sm text-red-500">{getError('password')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select name="is_active" defaultValue={initialData ? String(initialData.is_active) : 'true'} required>
                  <SelectTrigger id="is_active">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {getError('is_active') && <p className="text-sm text-red-500">{getError('is_active')}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" defaultValue={initialData?.address} placeholder="123 Main Street" required />
                {getError('address') && <p className="text-sm text-red-500">{getError('address')}</p>}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" type="button" onClick={() => router.back()} className="w-full sm:w-auto">
                Cancel
              </Button>
              <SubmitButton isEdit={isEdit} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
