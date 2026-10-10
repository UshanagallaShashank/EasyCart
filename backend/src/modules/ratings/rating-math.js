// Pure rules for ratings, with no database, so they are easy to read and test.

const round1 = (number) => Math.round(number * 10) / 10;

export function average(values) {
  if (values.length === 0) return null;
  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

// One { average, count } per store, from rows that have tenant_id and store_stars.
export function summarize_store_ratings(rows) {
  const stars_by_store = new Map();
  for (const row of rows) {
    const list = stars_by_store.get(row.tenant_id) ?? [];
    list.push(Number(row.store_stars));
    stars_by_store.set(row.tenant_id, list);
  }
  const summaries = new Map();
  for (const [tenant_id, stars] of stars_by_store) summaries.set(tenant_id, { average: average(stars), count: stars.length });
  return summaries;
}

// One { average, count } per product, from the stars customers gave each item in their orders.
export function summarize_product_ratings(rows) {
  const stars_by_product = {};
  for (const row of rows) {
    const item_stars = row.item_stars ?? {};
    for (const product_id of Object.keys(item_stars)) {
      if (!stars_by_product[product_id]) stars_by_product[product_id] = [];
      stars_by_product[product_id].push(Number(item_stars[product_id]));
    }
  }
  const summaries = {};
  for (const product_id of Object.keys(stars_by_product)) {
    const stars = stars_by_product[product_id];
    summaries[product_id] = { average: average(stars), count: stars.length };
  }
  return summaries;
}

// Keeps only stars for products that were really in this order, and only whole stars from 1 to 5.
export function keep_order_items(item_stars, order_items) {
  const in_order = new Set(order_items.map((item) => item.product_id));
  const kept = {};
  for (const product_id of Object.keys(item_stars ?? {})) {
    const stars = item_stars[product_id];
    if (in_order.has(product_id) && Number.isInteger(stars) && stars >= 1 && stars <= 5) kept[product_id] = stars;
  }
  return kept;
}

// A photo may be attached only if this customer uploaded it to our storage (their own folder).
export function is_own_photo(url, { public_prefix, customer_id }) {
  return typeof url === 'string' && public_prefix !== '' && url.startsWith(`${public_prefix}/${customer_id}/`);
}
