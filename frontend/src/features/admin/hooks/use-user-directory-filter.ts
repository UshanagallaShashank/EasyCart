// Role filter (kept in the URL) and search for the platform admin user directory.
import { useState } from 'react';
import { useUrlFilter } from '@/hooks/use-url-filter';
import type { PlatformRole, PlatformUser } from '../types/admin-types';

export type UserRoleFilter = 'all' | PlatformRole;

const ROLE_FILTER_LABELS: Record<UserRoleFilter, string> = { all: 'All', tenant_owner: 'Store owners', customer: 'Customers', platform_admin: 'Admins' };

export function useUserDirectoryFilter(users: PlatformUser[]) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useUrlFilter<UserRoleFilter>('role', ['all', 'tenant_owner', 'customer', 'platform_admin'], 'all');
  const term = search.trim().toLowerCase();
  const visible = users.filter((u) => (role === 'all' || u.role === role) && `${u.username} ${u.email} ${u.phone_number} ${u.store?.name ?? ''}`.toLowerCase().includes(term));
  const options = (Object.keys(ROLE_FILTER_LABELS) as UserRoleFilter[]).map((r) => ({ value: r, label: ROLE_FILTER_LABELS[r], count: users.filter((u) => r === 'all' || u.role === r).length }));

  return { search, setSearch, role, setRole, visible, options };
}
