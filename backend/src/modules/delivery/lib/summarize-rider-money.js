// Adds up a rider's deliveries, earnings and the cash they hold, from their orders and recorded settlements.
function same_day(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function round(value) {
  return Math.round(value * 100) / 100;
}

export function summarize_rider_money(orders, settlements, now = new Date()) {
  const delivered = orders.filter((order) => order.fulfillment_status === 'delivered');
  const today = delivered.filter((order) => order.delivered_at && same_day(new Date(order.delivered_at), now));
  const week_start = new Date(now);
  week_start.setDate(now.getDate() - 6);
  week_start.setHours(0, 0, 0, 0);
  const this_week = delivered.filter((order) => order.delivered_at && new Date(order.delivered_at) >= week_start);

  const sum = (rows, field) => round(rows.reduce((total, row) => total + Number(row[field] ?? 0), 0));
  const earnings = sum(delivered, 'rider_earning');
  const cash_collected = sum(delivered, 'cash_collected');
  const cash_deposited = sum(settlements.filter((row) => row.kind === 'cash_deposit'), 'amount');
  const paid_out = sum(settlements.filter((row) => row.kind === 'payout'), 'amount');

  return {
    deliveries: delivered.length,
    deliveries_today: today.length,
    deliveries_this_week: this_week.length,
    earnings,
    earnings_today: sum(today, 'rider_earning'),
    earnings_this_week: sum(this_week, 'rider_earning'),
    cash_collected,
    cash_deposited,
    cash_in_hand: round(cash_collected - cash_deposited),
    paid_out,
    payout_due: round(earnings - paid_out)
  };
}

// Deliveries and earnings for each of the last `days` days, oldest first.
export function rider_daily_series(orders, days = 14, now = new Date()) {
  const series = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    const rows = orders.filter((order) => order.fulfillment_status === 'delivered' && order.delivered_at && same_day(new Date(order.delivered_at), day));
    series.push({
      date: day.toISOString().slice(0, 10),
      deliveries: rows.length,
      earnings: round(rows.reduce((total, row) => total + Number(row.rider_earning ?? 0), 0))
    });
  }
  return series;
}
