// Platform-wide numbers for the admin overview: totals, 30-day daily sales, and top stores.
import { find_all_tenants } from '../../tenants/repositories/tenant-repository.js';
import { find_all_users_public } from '../../users/repositories/user-list-repository.js';
import { find_all_orders_for_stats } from '../../orders/repositories/order-stats-repository.js';
import { summarize_platform_totals } from './summarize-platform-totals.js';
import { summarize_daily_revenue } from './summarize-daily-revenue.js';
import { rank_top_stores } from './rank-top-stores.js';

const REVENUE_DAYS = 30;

export async function get_platform_stats() {
  const [tenants, users, orders] = await Promise.all([find_all_tenants(), find_all_users_public(), find_all_orders_for_stats()]);
  return {
    totals: summarize_platform_totals(tenants, users, orders),
    daily_revenue: summarize_daily_revenue(orders, REVENUE_DAYS),
    top_stores: rank_top_stores(tenants, orders)
  };
}
