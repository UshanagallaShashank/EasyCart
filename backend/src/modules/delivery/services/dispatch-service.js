// Hands each delivery to the nearest free rider. If they turn it down or do not answer in time, it goes to the next one.
import { find_store_by_tenant_id } from '../../stores/repositories/store-repository.js';
import { find_riders_by_status } from '../repositories/rider-repository.js';
import { find_orders_by_riders, find_orders_in_stages, update_order_if } from '../repositories/delivery-order-repository.js';
import { sort_riders_by_distance } from '../lib/sort-riders-by-distance.js';
import { ACTIVE_RIDER_STAGES, MAX_ACTIVE_ORDERS, OFFER_SECONDS, is_offer_expired, is_rider_available } from '../lib/delivery-stages.js';

export function store_point(store) {
  if (!store || store.latitude === null || store.latitude === undefined) return null;
  return { latitude: Number(store.latitude), longitude: Number(store.longitude) };
}

// How many orders each rider is carrying right now.
async function count_active_orders(riders) {
  const orders = await find_orders_by_riders(riders.map((rider) => rider.id));
  const counts = new Map();
  for (const order of orders) {
    if (order.status === 'cancelled' || !ACTIVE_RIDER_STAGES.includes(order.fulfillment_status)) continue;
    counts.set(order.rider_id, (counts.get(order.rider_id) ?? 0) + 1);
  }
  return counts;
}

// Picks the nearest rider who is online, has room, and has not already passed on this order.
export function choose_rider(riders, active_counts, declined_ids, origin, now = Date.now()) {
  const declined = new Set(declined_ids ?? []);
  const free = riders.filter((rider) => is_rider_available(rider, now) && !declined.has(rider.id) && (active_counts.get(rider.id) ?? 0) < MAX_ACTIVE_ORDERS);
  return sort_riders_by_distance(free, origin)[0] ?? null;
}

// Offers one order to the best rider. Leaves it waiting ("ready_for_delivery") when nobody is free.
export async function dispatch_order(order) {
  const [store, riders] = await Promise.all([find_store_by_tenant_id(order.tenant_id), find_riders_by_status('approved')]);
  const active_counts = await count_active_orders(riders);
  const rider = choose_rider(riders, active_counts, order.declined_rider_ids, store_point(store));
  const expected = { fulfillment_status: order.fulfillment_status, rider_id: order.rider_id ?? null };

  if (!rider) {
    return update_order_if(order.id, expected, { fulfillment_status: 'ready_for_delivery', rider_id: null, rider_offer_status: null, rider_offer_expires_at: null });
  }
  return update_order_if(order.id, expected, {
    fulfillment_status: 'rider_assigned',
    rider_id: rider.id,
    rider_offer_status: 'offered',
    rider_offer_expires_at: new Date(Date.now() + OFFER_SECONDS * 1000).toISOString()
  });
}

// Moves an unanswered offer on to the next rider.
async function pass_on_expired_offer(order) {
  const declined_rider_ids = [...(order.declined_rider_ids ?? []), order.rider_id];
  const released = await update_order_if(order.id, { rider_id: order.rider_id, rider_offer_status: 'offered' }, {
    fulfillment_status: 'ready_for_delivery', rider_id: null, rider_offer_status: null, rider_offer_expires_at: null, declined_rider_ids
  });
  if (released) await dispatch_order(released);
}

const REFRESH_EVERY_MS = 10 * 1000;
let last_refresh = 0;
let running = null;

// Looks at every waiting order and every expired offer. Runs when riders or stores open their screens,
// at most every few seconds, so no background timer is needed.
export function refresh_dispatch({ force = false } = {}) {
  if (running) return running;
  if (!force && Date.now() - last_refresh < REFRESH_EVERY_MS) return Promise.resolve();
  last_refresh = Date.now();
  running = (async () => {
    const orders = await find_orders_in_stages(['ready_for_delivery', 'rider_assigned']);
    for (const order of orders) {
      if (order.fulfillment_status === 'ready_for_delivery' && !order.rider_id) await dispatch_order(order);
      else if (is_offer_expired(order)) await pass_on_expired_offer(order);
    }
  })().finally(() => { running = null; });
  return running;
}
