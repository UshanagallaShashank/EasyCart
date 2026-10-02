// The rules an order follows, as plain functions with no database, so they are easy to read and test.

// Where an order can go from each status. Fulfilled and cancelled orders are closed for good.
const NEXT_STATUS = {
  pending: ['confirmed', 'fulfilled', 'cancelled'],
  confirmed: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: []
};

export function is_closed(order) {
  return order.status === 'fulfilled' || order.status === 'cancelled';
}

// Returns why the store may not move the order to `next`, or null when it may.
export function status_change_problem(order, next, { rider_handled }) {
  if (order.status === next) return null;
  if (!NEXT_STATUS[order.status]?.includes(next)) {
    if (order.status === 'cancelled') return 'This order was cancelled and cannot be reopened';
    if (order.status === 'fulfilled') return 'This order is already complete';
    return `An order cannot go from ${order.status} to ${next}`;
  }
  if (next === 'cancelled' && rider_handled && order.fulfillment_status === 'dispatched') {
    return 'The rider already has this order. Call them to bring it back before cancelling.';
  }
  if (next === 'fulfilled' && rider_handled && order.fulfillment_status !== 'delivered') {
    return "The order is fulfilled when the delivery partner hands it over with the customer's code";
  }
  return null;
}

// Adds up repeated cart lines (the same product and size added twice), so stock is checked against the real total.
export function merge_cart_lines(items) {
  const merged = new Map();
  for (const item of items) {
    const key = `${item.product_id}::${item.variant_label ?? ''}`;
    const existing = merged.get(key);
    if (existing) existing.quantity += item.quantity;
    else merged.set(key, { ...item });
  }
  return [...merged.values()];
}

// The product's new stock after taking (sign -1) or returning (sign +1) these lines.
// Lines with a size/colour change that variant's stock; plain lines change the product's own stock.
// Returns { stock_quantity, variants } or { problem } when there is not enough.
export function plan_stock_change(product, lines, sign) {
  let stock_quantity = Number(product.stock_quantity ?? 0);
  const variants = (product.variants ?? []).map((variant) => ({ ...variant }));

  for (const line of lines) {
    const change = sign * line.quantity;
    if (line.variant_label) {
      const variant = variants.find((v) => v.label === line.variant_label);
      if (!variant) return { problem: `${product.name} (${line.variant_label}) is no longer available` };
      if (variant.stock + change < 0) return { problem: `Only ${variant.stock} left of ${product.name} (${line.variant_label})` };
      variant.stock += change;
    } else {
      if (stock_quantity + change < 0) return { problem: stock_quantity > 0 ? `Only ${stock_quantity} left of ${product.name}` : `${product.name} is out of stock` };
      stock_quantity += change;
    }
  }
  return { stock_quantity, variants };
}
