// Customer auth state shape and the hook components use to read/update it.
import { createContext, useContext } from 'react';
import type { CustomerUser } from '@/features/customer-auth/types/customer-auth-types';

export interface CustomerAuthState {
  user: CustomerUser | null;
  login(user: CustomerUser, token: string): void;
  logout(): void;
}

export const CustomerAuthContext = createContext<CustomerAuthState | null>(null);

export function useCustomerAuth(): CustomerAuthState {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
