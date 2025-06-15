'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { loginAction, type FormState } from '@/lib/actions';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  );
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const router = useRouter();
  const initialState: FormState = { message: '', success: false };
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success('Login successful!', {
        description: 'Redirecting to your dashboard...',
      });
      router.push('/dashboard');
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">Enter your email below to login to your account</p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" type="text" placeholder="e.g. DriverA" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        <LoginButton />
      </div>
    </form>
  );
}
