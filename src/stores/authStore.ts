import { create } from 'zustand';

interface Permission {
  name: string;
}

interface Role {
  id: string;
  role_name: string;
  permissions?: Permission[];
}

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  role: Role;
}
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  authStatus: AuthStatus;
  setUser: (user: User | null) => void;
  setAuthStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authStatus: 'loading',
  setUser: (user) => set({ user }),
  setAuthStatus: (status) => set({ authStatus: status }),
}));
