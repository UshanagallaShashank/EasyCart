// Turns a store's products and orders into the headline numbers shown to platform admins.
function to_time(value) {
  return new Date(value).getTime();
}

export function summarize_tenant_activity(products, orders) {
  const counted = orders.filter((order) => order.status !== 'cancelled');
  const newest_first = [...orders].sort((a, b) => to_time(b.created_at) - to_time(a.created_at));
  return {
    product_count: products.length,
    active_product_count: products.filter((p) => p.is_active).length,
    low_stock_count: products.filter((p) => p.stock_quantity <= p.low_stock_threshold).length,
    order_count: orders.length,
    pending_order_count: orders.filter((o) => o.status === 'pending').length,
    revenue: counted.reduce((sum, o) => sum + Number(o.total || 0), 0),
    customer_count: new Set(orders.map((o) => o.customer_id)).size,
    last_order_at: newest_first[0]?.created_at ?? null,
    recent_orders: newest_first.slice(0, 5).map((o) => ({ id: o.id, total: o.total, status: o.status, payment_status: o.payment_status, created_at: o.created_at }))
  };
}
