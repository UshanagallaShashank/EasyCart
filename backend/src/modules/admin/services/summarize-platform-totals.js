// Headline platform numbers: stores, people by role, orders, and sales (cancelled orders excluded).
export function summarize_platform_totals(tenants, users, orders) {
  const counted = orders.filter((o) => o.status !== 'cancelled');
  const count_role = (role) => users.filter((u) => u.role === role).length;
  return {
    stores: tenants.length,
    active_stores: tenants.filter((t) => t.status === 'active').length,
    owners: count_role('tenant_owner'),
    customers: count_role('customer'),
    admins: count_role('platform_admin'),
    orders: orders.length,
    pending_orders: orders.filter((o) => o.status === 'pending').length,
    gmv: counted.reduce((sum, o) => sum + Number(o.total || 0), 0)
  };
}
