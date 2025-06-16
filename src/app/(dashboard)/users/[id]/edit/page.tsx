import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserById } from '@/services/userService';
import { UserForm } from '../../components/user-form';
import { PageTransition } from '@/components/page-transition';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const id = Number(params.id);
    const user = await getUserById(id);
    return {
      title: `Edit User: ${user.name}`,
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'User Not Found',
    };
  }
}

export default async function EditUserPage(props: Props) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    notFound();
  }

  let user;
  try {
    user = await getUserById(id);
  } catch (error) {
    console.error(`Failed to fetch user with ID ${id}:`, error);
    notFound();
  }

  return (
    <PageTransition>
      <UserForm initialData={user} />
    </PageTransition>
  );
}
