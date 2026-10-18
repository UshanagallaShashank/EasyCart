// Status filter (kept in the URL so sidebar sub-links work), search and sort for the admin rider list.
import { useState } from 'react';
import { useUrlFilter } from '@/hooks/use-url-filter';
import type { AdminRiderRow, RiderStatus } from '@/features/delivery/types/delivery-types';

export type RiderFilter = 'all' | 'online' | RiderStatus;
export type RiderSort = 'newest' | 'nearest' | 'city' | 'deliveries' | 'cash';

const FILTER_LABELS: Record<RiderFilter, string> = { all: 'All', pending: 'In review', approved: 'Approved', online: 'Online now', suspended: 'Suspended', rejected: 'Rejected', draft: 'Not sent' };
const FILTERS = Object.keys(FILTER_LABELS) as RiderFilter[];

function matches(rider: AdminRiderRow, filter: RiderFilter) {
  if (filter === 'all') return true;
  if (filter === 'online') return rider.status === 'approved' && rider.is_online;
  return rider.status === filter;
}

const SORTERS: Record<RiderSort, (a: AdminRiderRow, b: AdminRiderRow) => number> = {
  newest: (a, b) => new Date(b.submitted_at ?? b.created_at).getTime() - new Date(a.submitted_at ?? a.created_at).getTime(),
  // The server already returns riders nearest-first when a store is chosen.
  nearest: () => 0,
  city: (a, b) => `${a.city ?? '~'} ${a.area ?? ''}`.localeCompare(`${b.city ?? '~'} ${b.area ?? ''}`),
  deliveries: (a, b) => b.deliveries - a.deliveries,
  cash: (a, b) => b.cash_in_hand - a.cash_in_hand
};

export function useRiderListFilter(riders: AdminRiderRow[]) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useUrlFilter<RiderFilter>('status', FILTERS, 'all');
  const [sort, setSort] = useState<RiderSort>('newest');
  const term = search.trim().toLowerCase();

  const visible = riders
    .filter((rider) => matches(rider, filter))
    .filter((rider) => `${rider.full_name} ${rider.email} ${rider.phone_number} ${rider.vehicle_number ?? ''} ${rider.city ?? ''} ${rider.area ?? ''} ${rider.pincode ?? ''}`.toLowerCase().includes(term))
    .sort(SORTERS[sort]);
  const options = FILTERS.map((value) => ({ value, label: FILTER_LABELS[value], count: riders.filter((rider) => matches(rider, value)).length }));

  return { search, setSearch, filter, setFilter, sort, setSort, visible, options };
}
