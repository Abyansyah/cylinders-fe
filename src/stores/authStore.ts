import { create } from 'zustand';

interface Role {
  id: string;
  role_name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
