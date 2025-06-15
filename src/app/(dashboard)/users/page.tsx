import { Metadata } from 'next';
import React from 'react';
import UserTable from './components/user-table';

export const metadata: Metadata = {
  title: 'User Management',
  description: 'Manage all users in the system.',
};

const UsersPage = () => {
  return (
    <>
      <UserTable />
    </>
  );
};

export default UsersPage;
