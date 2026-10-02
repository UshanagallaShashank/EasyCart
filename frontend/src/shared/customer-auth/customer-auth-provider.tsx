// Owns customer auth state, independent of the owner's auth-provider.
import { useState, type ReactNode } from 'react';
import { CustomerAuthContext } from './customer-auth-context';
import { setToken, clearToken } from './token-storage';
import { getStoredUser, setStoredUser, clearStoredUser } from './user-storage';
import { setUnauthorizedHandler } from '@/shared/api/api-client';
import type { CustomerUser } from '@/features/customer-auth/types/customer-auth-types';

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(() => getStoredUser());

  function login(nextUser: CustomerUser, token: string) {
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

  setUnauthorizedHandler(logout, 'customer');

  return <CustomerAuthContext.Provider value={{ user, login, logout }}>{children}</CustomerAuthContext.Provider>;
}
