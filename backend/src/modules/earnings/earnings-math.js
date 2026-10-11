// Who earns what from a delivered order. Pure rules, no database, easy to test.
//
//   items value   = what the customer paid minus the delivery fee (coupon discounts already taken off)
//   commission    = the platform's percentage of the items value, paid by the shop
//   delivery fee  = goes to the rider when a rider delivered it (split with the platform), else to the shop
const round2 = (number) => Math.round(number * 100) / 100;

export function order_amounts(order, rates) {
  const delivery_fee = Number(order.delivery_fee || 0);
  const items_value = Math.max(0, Number(order.total || 0) - delivery_fee);
  const commission = round2((items_value * rates.commission_percent) / 100);
  const rider_delivered = Boolean(order.rider_id);
  const rider_pay = rider_delivered ? round2((delivery_fee * rates.rider_share_percent) / 100) : 0;
  const platform_delivery_cut = rider_delivered ? round2(delivery_fee - rider_pay) : 0;

  return {
    items_value,
    commission,
    rider_pay,
    platform_earns: round2(commission + platform_delivery_cut),
    // The shop keeps its items minus commission, plus the delivery fee when it delivered the order itself.
    shop_keeps: round2(items_value - commission + (rider_delivered ? 0 : delivery_fee))
  };
}

const EMPTY_TOTALS = { orders: 0, items_value: 0, commission: 0, rider_pay: 0, platform_earns: 0, shop_keeps: 0 };

export function add_order(totals, order, rates) {
  const amounts = order_amounts(order, rates);
  return {
    orders: totals.orders + 1,
    items_value: round2(totals.items_value + amounts.items_value),
    commission: round2(totals.commission + amounts.commission),
    rider_pay: round2(totals.rider_pay + amounts.rider_pay),
    platform_earns: round2(totals.platform_earns + amounts.platform_earns),
    shop_keeps: round2(totals.shop_keeps + amounts.shop_keeps)
  };
}

export function sum_orders(orders, rates) {
  return orders.reduce((totals, order) => add_order(totals, order, rates), EMPTY_TOTALS);
}

function day_key(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// One row per day for the last `days` days (oldest first), including quiet days with zeros.
export function sum_by_day(orders, rates, days, now = new Date()) {
  const rows = [];
  for (let back = days - 1; back >= 0; back -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - back);
    const key = day_key(date);
    const that_day = orders.filter((order) => day_key(new Date(order.created_at)) === key);
    rows.push({ date: key, ...sum_orders(that_day, rates) });
  }
  return rows;
}
