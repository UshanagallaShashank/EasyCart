// Works out which stores a customer belongs to: the published stores they have ordered from, most recent order first.
export function pick_customer_stores(orders, stores) {
  const newest_first = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const store_by_tenant = new Map(stores.map((store) => [store.tenant_id, store]));

  const picked = [];
  const already_added = new Set();

  for (const order of newest_first) {
    const store = store_by_tenant.get(order.tenant_id);
    const can_show = store && store.is_published && !already_added.has(store.tenant_id);
    if (!can_show) continue;

    already_added.add(store.tenant_id);
    // Radius and pincode let the customer home page say whether the store delivers to them.
    picked.push({ slug: store.slug, name: store.name, logo_url: store.logo_url ?? null, max_delivery_radius_km: store.max_delivery_radius_km ?? null, pincode: store.pincode ?? null });
  }

  return picked;
}
