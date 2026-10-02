// Owns auth state, hydrates from storage, and wires the global 401 handler.
import { useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import { setToken, clearToken } from './token-storage';
import { getStoredUser, setStoredUser, clearStoredUser } from './user-storage';
import { setUnauthorizedHandler } from '@/shared/api/api-client';
import type { User } from '@/features/auth/types/auth-types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  function login(nextUser: User, token: string) {
    setToken(token);
    setStoredUser(nextUser);
    setUser(nextUser);
  }

  // Logging out (or an expired session) always lands on the one login page, whichever page you were on.
  // It reloads the page on purpose: that clears everything held in memory and cannot race with a page's own sign-in check.
  function logout() {
    clearToken();
    clearStoredUser();
    window.location.assign('/login');
  }

  setUnauthorizedHandler(logout);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
