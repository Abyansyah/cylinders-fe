'use client';

import { useAuth } from '@/hooks/use-auth';
import React from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth();

  return <>{children}</>;
}
