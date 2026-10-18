// Persists the logged-in customer so a page refresh doesn't lose auth state.
import type { CustomerUser } from '@/features/customer-auth/types/customer-auth-types';

const USER_KEY = 'customer_auth_user';

export function getStoredUser(): CustomerUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as CustomerUser) : null;
}

export function setStoredUser(user: CustomerUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}
