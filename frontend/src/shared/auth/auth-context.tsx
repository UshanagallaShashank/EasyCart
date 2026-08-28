// Auth state shape and the hook components use to read/update it.
import { createContext, useContext } from 'react';
import type { User } from '@/features/auth/types/auth-types';

export interface AuthState {
  user: User | null;
  login(user: User, token: string): void;
  logout(): void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
