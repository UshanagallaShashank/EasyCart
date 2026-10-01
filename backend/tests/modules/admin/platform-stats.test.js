// Unit tests for platform-wide admin numbers: totals, daily sales series, and top stores.
import { describe, it, expect } from 'vitest';
import { summarize_platform_totals } from '../../../src/modules/admin/services/summarize-platform-totals.js';
import { summarize_daily_revenue } from '../../../src/modules/admin/services/summarize-daily-revenue.js';
import { rank_top_stores } from '../../../src/modules/admin/services/rank-top-stores.js';

const tenants = [{ id: 't1', name: 'A', slug: 'a', status: 'active' }, { id: 't2', name: 'B', slug: 'b', status: 'suspended' }, { id: 't3', name: 'C', slug: 'c', status: 'active' }];
const users = [{ role: 'tenant_owner' }, { role: 'tenant_owner' }, { role: 'customer' }, { role: 'platform_admin' }];
const orders = [
  { tenant_id: 't1', total: 100, status: 'fulfilled', created_at: '2026-10-01T05:00:00Z' },
  { tenant_id: 't1', total: 40, status: 'cancelled', created_at: '2026-10-01T06:00:00Z' },
  { tenant_id: 't2', total: 300, status: 'pending', created_at: '2026-09-30T08:00:00Z' },
  { tenant_id: 't1', total: 10, status: 'confirmed', created_at: '2026-08-01T08:00:00Z' }
];

describe('summarize_platform_totals', () => {
  it('counts stores, roles, orders, pending, and sales without cancelled orders', () => {
    expect(summarize_platform_totals(tenants, users, orders)).toEqual({ stores: 3, active_stores: 2, owners: 2, customers: 1, admins: 1, orders: 4, pending_orders: 1, gmv: 410 });
  });
});

describe('summarize_daily_revenue', () => {
  it('returns one entry per day, oldest first, only for days in range', () => {
    const series = summarize_daily_revenue(orders, 3, new Date('2026-10-01T12:00:00Z'));
    expect(series).toEqual([
      { date: '2026-09-29', revenue: 0, orders: 0 },
      { date: '2026-09-30', revenue: 300, orders: 1 },
      { date: '2026-10-01', revenue: 100, orders: 1 }
    ]);
  });
});

describe('rank_top_stores', () => {
  it('ranks stores with sales by revenue and skips stores without sales', () => {
    expect(rank_top_stores(tenants, orders)).toEqual([
      { tenant_id: 't2', name: 'B', slug: 'b', revenue: 300, orders: 1 },
      { tenant_id: 't1', name: 'A', slug: 'a', revenue: 110, orders: 2 }
    ]);
  });

  it('respects the limit', () => {
    expect(rank_top_stores(tenants, orders, 1)).toHaveLength(1);
  });
});
