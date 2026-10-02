// Derives "this tenant's customers" from order history — no separate customer-tenant table.
import { AppError } from '../../../platform/shared/app-error.js';
import { to_owner_order } from '../../orders/lib/order-views.js';
import { find_orders_by_tenant, find_orders_by_customer_and_tenant } from '../../orders/repositories/order-query-repository.js';
import { find_users_by_ids } from '../../users/repositories/user-repository.js';

function summarize_orders_by_customer(orders) {
  const summaries = new Map();
  for (const order of orders) {
    const existing = summaries.get(order.customer_id) ?? { order_count: 0, lifetime_total: 0, last_order_at: order.created_at };
    existing.order_count += 1;
    existing.lifetime_total += order.total;
    if (new Date(order.created_at) > new Date(existing.last_order_at)) {
      existing.last_order_at = order.created_at;
    }
    summaries.set(order.customer_id, existing);
  }
  return summaries;
}

export async function list_tenant_customers(tenant_id) {
  const orders = await find_orders_by_tenant(tenant_id);
  const summaries = summarize_orders_by_customer(orders);

  const customer_ids = [...summaries.keys()];
  const users = await find_users_by_ids(customer_ids);
  const user_by_id = new Map(users.map((user) => [user.id, user]));

  return customer_ids.map((customer_id) => {
    const user = user_by_id.get(customer_id);
    const summary = summaries.get(customer_id);
    return {
      customer_id,
      username: user?.username ?? null,
      email: user?.email ?? null,
      order_count: summary.order_count,
      lifetime_total: summary.lifetime_total,
      last_order_at: summary.last_order_at
    };
  });
}

export async function find_customers_with_no_recent_orders(tenant_id, days) {
  const customers = await list_tenant_customers(tenant_id);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return customers.filter((customer) => new Date(customer.last_order_at) < cutoff);
}

export async function get_tenant_customer_history(tenant_id, customer_id) {
  const orders = await find_orders_by_customer_and_tenant(customer_id, tenant_id);
  if (orders.length === 0) {
    throw new AppError('Customer not found', 404);
  }
  const [user] = await find_users_by_ids([customer_id]);
  return {
    customer_id,
    username: user?.username ?? null,
    email: user?.email ?? null,
    orders: orders.map(to_owner_order)
  };
}
