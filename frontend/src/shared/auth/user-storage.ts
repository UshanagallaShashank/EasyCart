// Persists the logged-in user object so a page refresh doesn't lose auth state.
import type { User } from '@/features/auth/types/auth-types';

const USER_KEY = 'auth_user';

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}
