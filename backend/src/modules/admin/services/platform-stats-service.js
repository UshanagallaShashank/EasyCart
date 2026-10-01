// Platform-wide numbers for the admin overview (totals, 30-day daily sales, top stores), cached for 30 seconds.
import { find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { find_all_users_public } from '../../users/repositories/user-list-repository.js';
import { create_ttl_cache } from '../../../platform/shared/ttl-cache.js';
import { orders_snapshot, ADMIN_STATS_TTL_MS } from './admin-data-cache.js';
import { summarize_platform_totals } from './summarize-platform-totals.js';
import { summarize_daily_revenue } from './summarize-daily-revenue.js';
import { rank_top_stores } from './rank-top-stores.js';

const REVENUE_DAYS = 30;

async function load_platform_stats() {
  const [tenants, users, orders] = await Promise.all([find_all_tenants(), find_all_users_public(), orders_snapshot.get()]);
  return {
    totals: summarize_platform_totals(tenants, users, orders),
    daily_revenue: summarize_daily_revenue(orders, REVENUE_DAYS),
    top_stores: rank_top_stores(tenants, orders)
  };
}

export const platform_stats_cache = create_ttl_cache(load_platform_stats, ADMIN_STATS_TTL_MS);

export function get_platform_stats() {
  return platform_stats_cache.get();
}
