import { customerOrdersPath } from '@/features/storefront/lib/customer-paths';

// Decides where a person lands after signing in, based on their account's role.
export type AccountRole = 'customer' | 'tenant_owner' | 'platform_admin' | 'delivery_partner';

export function getHomeForRole(role: AccountRole, redirectTo: string | null, lastStoreSlug: string | null): string {
  if (role === 'platform_admin') return '/admin';
  if (role === 'tenant_owner') return '/dashboard';
  if (role === 'delivery_partner') return '/rider';

  // Customers go back to where they were heading (for example checkout), else to their orders.
  if (redirectTo) return redirectTo;
  // Customer pages always belong to a shop. With no shop known yet, "/" explains how to open one.
  return lastStoreSlug ? customerOrdersPath(lastStoreSlug) : '/';
}
