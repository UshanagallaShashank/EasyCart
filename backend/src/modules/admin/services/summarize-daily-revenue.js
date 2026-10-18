// Per-day (UTC) sales and order counts for the last N days, oldest first; cancelled orders excluded.
const DAY_MS = 24 * 60 * 60 * 1000;

function to_utc_day(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export function summarize_daily_revenue(orders, days, now = new Date()) {
  const series = Array.from({ length: days }, (_, i) => ({ date: to_utc_day(now.getTime() - (days - 1 - i) * DAY_MS), revenue: 0, orders: 0 }));
  const by_date = new Map(series.map((d) => [d.date, d]));
  for (const order of orders) {
    const day = by_date.get(to_utc_day(order.created_at));
    if (!day || order.status === 'cancelled') continue;
    day.revenue += Number(order.total || 0);
    day.orders += 1;
  }
  return series;
}
