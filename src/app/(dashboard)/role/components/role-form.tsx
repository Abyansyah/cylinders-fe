'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createRoleAction, updateRoleAction, type FormState } from '../actions/roleActions';
import type { Role } from '@/types/role';

interface RoleFormProps {
  initialData?: Role | null;
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
        'Update Role'
      ) : (
        'Create Role'
      )}
    </Button>
  );
}

export function RoleForm({ initialData }: RoleFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const action = isEdit ? updateRoleAction.bind(null, initialData.id) : createRoleAction;
  const initialState: FormState = { message: '', success: false, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message || (isEdit ? 'Role updated successfully!' : 'Role created successfully!'));
      router.push('/role');
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, isEdit, router]);

  const getError = (field: string) => state.errors?.[field]?.[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push('/role')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{isEdit ? 'Role Details' : 'Create Role'}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Role' : 'Create a New Role'}</CardTitle>
          <CardDescription>{isEdit ? `Editing the role for ${initialData.role_name}` : 'Fill in the details below to add a new role.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="role_name">Role Name</Label>
              <Input id="role_name" name="role_name" defaultValue={initialData?.role_name} placeholder="e.g. Administrator" required />
              {getError('role_name') && <p className="text-sm text-red-500">{getError('role_name')}</p>}
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
