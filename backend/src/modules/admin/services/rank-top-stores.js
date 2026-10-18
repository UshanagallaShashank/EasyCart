// The stores with the most sales (cancelled orders excluded), highest first.
export function rank_top_stores(tenants, orders, limit = 5) {
  const totals = new Map();
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    const entry = totals.get(order.tenant_id) ?? { revenue: 0, orders: 0 };
    entry.revenue += Number(order.total || 0);
    entry.orders += 1;
    totals.set(order.tenant_id, entry);
  }
  return tenants
    .filter((t) => totals.has(t.id))
    .map((t) => ({ tenant_id: t.id, name: t.name, slug: t.slug, ...totals.get(t.id) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
