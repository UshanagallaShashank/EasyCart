// Owns customer auth state, independent of the owner's auth-provider.
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CustomerAuthContext } from './customer-auth-context';
import { setToken, clearToken } from './token-storage';
import { getStoredUser, setStoredUser, clearStoredUser } from './user-storage';
import { customerLoginPath, getLastStoreSlug } from '@/features/storefront/lib/customer-paths';
import { setUnauthorizedHandler } from '@/shared/api/api-client';
import type { CustomerUser } from '@/features/customer-auth/types/customer-auth-types';

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(() => getStoredUser());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function login(nextUser: CustomerUser, token: string) {
    setToken(token);
    setStoredUser(nextUser);
    setUser(nextUser);
  }

  function logout() {
    clearToken();
    clearStoredUser();
    setUser(null);
    queryClient.removeQueries({ queryKey: ['my-orders'] });
  }

  setUnauthorizedHandler(() => {
    logout();
    const shopSlug = getLastStoreSlug();
    navigate(shopSlug ? customerLoginPath(shopSlug) : '/login');
  }, 'customer');

  return <CustomerAuthContext.Provider value={{ user, login, logout }}>{children}</CustomerAuthContext.Provider>;
}
