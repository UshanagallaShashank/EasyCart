// Search text, status filter (kept in the URL), and sort order for the platform admin store list.
import { useState } from 'react';
import { useUrlFilter } from '@/hooks/use-url-filter';
import type { AdminTenant } from '../types/admin-types';

export type TenantFilter = 'all' | 'live' | 'unpublished' | 'suspended';
export type TenantSort = 'newest' | 'oldest' | 'name';

const FILTER_TESTS: Record<TenantFilter, (t: AdminTenant) => boolean> = {
  all: () => true,
  live: (t) => t.status === 'active' && t.is_published,
  unpublished: (t) => t.status === 'active' && !t.is_published,
  suspended: (t) => t.status === 'suspended'
};

const SORTERS: Record<TenantSort, (a: AdminTenant, b: AdminTenant) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  oldest: (a, b) => a.created_at.localeCompare(b.created_at),
  name: (a, b) => a.name.localeCompare(b.name)
};

export function useTenantListFilter(tenants: AdminTenant[]) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useUrlFilter<TenantFilter>('status', ['all', 'live', 'unpublished', 'suspended'], 'all');
  const [sort, setSort] = useState<TenantSort>('newest');
  const term = search.trim().toLowerCase();
  const visible = tenants.filter((t) => FILTER_TESTS[filter](t) && `${t.name} ${t.slug} ${t.owner_email ?? ''} ${t.owner_username ?? ''}`.toLowerCase().includes(term)).sort(SORTERS[sort]);
  const labels: Record<TenantFilter, string> = { all: 'All', live: 'Live', unpublished: 'Not published', suspended: 'Suspended' };
  const options = (Object.keys(FILTER_TESTS) as TenantFilter[]).map((f) => ({ value: f, label: labels[f], count: tenants.filter(FILTER_TESTS[f]).length }));

  return { search, setSearch, filter, setFilter, sort, setSort, visible, options };
}
