import type { Metadata } from 'next';
import { UserForm } from '../components/user-form';
import { PageTransition } from '@/components/page-transition';

export const metadata: Metadata = {
  title: 'Create User',
  description: 'Add a new user to the system.',
};

export default function CreateUserPage() {
  return (
    <PageTransition>
      <UserForm />
    </PageTransition>
  );
}
