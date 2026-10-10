// The earnings numbers the shop owner and the platform admin see, worked out from delivered orders.
import { PLATFORM_COMMISSION_PERCENT, RIDER_SHARE_PERCENT } from '../../env.js';
import { find_orders_by_tenant } from '../orders/repositories/order-query-repository.js';
import { find_delivered_orders_for_earnings } from '../orders/repositories/order-stats-repository.js';
import { find_all_tenants } from '../tenants/repositories/tenant-repository.js';
import { sum_orders, sum_by_day } from './earnings-math.js';

const rates = { commission_percent: PLATFORM_COMMISSION_PERCENT, rider_share_percent: RIDER_SHARE_PERCENT };
const DAYS = 7;

function in_last_days(orders, days) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return orders.filter((order) => new Date(order.created_at).getTime() >= since);
}

export async function get_owner_earnings(tenant_id) {
  const orders = (await find_orders_by_tenant(tenant_id)).filter((order) => order.status === 'fulfilled');
  return {
    commission_percent: rates.commission_percent,
    all_time: sum_orders(orders, rates),
    last_7_days: sum_orders(in_last_days(orders, DAYS), rates),
    by_day: sum_by_day(orders, rates, DAYS)
  };
}

export async function get_platform_earnings() {
  const [orders, tenants] = await Promise.all([find_delivered_orders_for_earnings(), find_all_tenants()]);

  const per_store = tenants
    .map((tenant) => ({ tenant_id: tenant.id, name: tenant.name, slug: tenant.slug, ...sum_orders(orders.filter((order) => order.tenant_id === tenant.id), rates) }))
    .filter((store) => store.orders > 0)
    .sort((a, b) => b.platform_earns - a.platform_earns);

  return {
    commission_percent: rates.commission_percent,
    rider_share_percent: rates.rider_share_percent,
    all_time: sum_orders(orders, rates),
    last_7_days: sum_orders(in_last_days(orders, DAYS), rates),
    by_day: sum_by_day(orders, rates, DAYS),
    per_store
  };
}
