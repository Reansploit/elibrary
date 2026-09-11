import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../lib/types';

interface AuthState {
  token?: string;
  nama?: string;
  username?: string;
  role?: Role;
  login: (t: { token: string; nama: string; username: string; role: Role }) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      login: ({ token, nama, username, role }) => set({ token, nama, username, role }),
      logout: () => set({ token: undefined, nama: undefined, username: undefined, role: undefined }),
    }),
    { name: 'elib_auth' },
  ),
);
