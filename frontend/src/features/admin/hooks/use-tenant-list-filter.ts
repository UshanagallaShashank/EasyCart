// Search text and status filter for the platform admin store list.
import { useState } from 'react';
import type { AdminTenant } from '../types/admin-types';

export type TenantFilter = 'all' | 'active' | 'suspended';

export function useTenantListFilter(tenants: AdminTenant[]) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TenantFilter>('all');
  const term = search.trim().toLowerCase();
  const visible = tenants.filter((t) => (filter === 'all' || t.status === filter) && `${t.name} ${t.slug} ${t.owner_email ?? ''}`.toLowerCase().includes(term));
  const count = (f: TenantFilter) => tenants.filter((t) => f === 'all' || t.status === f).length;
  const options = (['all', 'active', 'suspended'] as TenantFilter[]).map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1), count: count(f) }));

  return { search, setSearch, filter, setFilter, visible, options };
}
