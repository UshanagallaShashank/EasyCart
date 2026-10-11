// First come, first served. Once a store says an order is packed, every free rider near the store sees it.
// The first rider to accept gets it, and it disappears for everyone else. A rider who declines just stops seeing it.
import { find_store_by_tenant_id } from '../../stores/repositories/store-repository.js';
import { find_orders_by_rider, find_orders_in_stages, update_order_if } from '../repositories/delivery-order-repository.js';
import { haversine_km } from '../lib/haversine-km.js';
import { ACTIVE_RIDER_STAGES, MAX_ACTIVE_ORDERS, MAX_DISPATCH_KM, is_rider_available } from '../lib/delivery-stages.js';

export function store_point(store) {
  if (!store || store.latitude === null || store.latitude === undefined) return null;
  return { latitude: Number(store.latitude), longitude: Number(store.longitude) };
}

// How many orders this rider has accepted and not finished. An offer they never accepted does not count.
async function count_my_active_orders(rider) {
  const orders = await find_orders_by_rider(rider.id);
  const active = orders.filter((order) => order.status !== 'cancelled' && ACTIVE_RIDER_STAGES.includes(order.fulfillment_status) && order.rider_offer_status !== 'offered');
  return active.length;
}

// Why this rider cannot take this order, in words for the rider, or null when they can.
// A rider or store with no location yet is not turned away for distance.
// Passing on an order does not stop the rider taking it later; it only moves it to their "passed on" list.
export function why_rider_cannot_take(rider, order, active_count, origin, now = Date.now()) {
  if (!order || order.status === 'cancelled') return 'This order was cancelled';
  if (order.rider_id === rider.id) return 'You already accepted this order. Find it under your current deliveries.';
  if (order.fulfillment_status !== 'ready_for_delivery' || order.rider_id) return 'Another rider already took this order';
  if (!is_rider_available(rider, now)) return 'Go online to take orders';
  if (active_count >= MAX_ACTIVE_ORDERS) return `You already have ${MAX_ACTIVE_ORDERS} orders. Deliver one before taking another.`;
  const km = haversine_km(origin, rider);
  if (km !== null && km > MAX_DISPATCH_KM) return 'This shop is too far from you';
  return null;
}

export function rider_passed_on(rider, order) {
  return (order.declined_rider_ids ?? []).includes(rider.id);
}

// True when this waiting order belongs in the rider's "new offers": they can take it and have not passed on it.
export function can_see_order(rider, order, active_count, origin, now = Date.now()) {
  return why_rider_cannot_take(rider, order, active_count, origin, now) === null && !rider_passed_on(rider, order);
}

// Every packed order no rider has taken yet.
async function find_waiting_orders() {
  const orders = await find_orders_in_stages(['ready_for_delivery']);
  return orders.filter((order) => !order.rider_id);
}

// The waiting orders this rider can take (including ones they passed on), oldest first so the order that has waited longest is on top.
export async function find_open_orders_for(rider) {
  const waiting = await find_waiting_orders();
  if (waiting.length === 0) return [];
  const active_count = await count_my_active_orders(rider);

  // Each store is looked up once, even when it has several waiting orders.
  const stores = new Map();
  for (const order of waiting) {
    if (!stores.has(order.tenant_id)) stores.set(order.tenant_id, await find_store_by_tenant_id(order.tenant_id));
  }

  const open = waiting.filter((order) => why_rider_cannot_take(rider, order, active_count, store_point(stores.get(order.tenant_id))) === null);
  return open.sort((a, b) => new Date(a.ready_at ?? a.created_at) - new Date(b.ready_at ?? b.created_at));
}

// Why this rider cannot take this one order right now, or null when they can.
export async function check_rider_can_take(rider, order) {
  if (!order) return 'This order was cancelled';
  const [store, active_count] = await Promise.all([find_store_by_tenant_id(order.tenant_id), count_my_active_orders(rider)]);
  return why_rider_cannot_take(rider, order, active_count, store_point(store));
}

// Before first come, first served, an order was offered to one rider at a time.
// Any order still offered that way goes back to the open list, where every nearby rider can see it.
export async function release_offer(order) {
  return update_order_if(order.id, { rider_id: order.rider_id, rider_offer_status: 'offered' }, {
    fulfillment_status: 'ready_for_delivery', rider_id: null, rider_offer_status: null, rider_offer_expires_at: null
  });
}

let running = null;

export function release_old_offers() {
  if (running) return running;
  running = (async () => {
    const orders = await find_orders_in_stages(['rider_assigned']);
    for (const order of orders) {
      if (order.rider_offer_status === 'offered') await release_offer(order);
    }
  })().finally(() => { running = null; });
  return running;
}

// The Vercel entry point (api/index.js) still calls this name on incoming requests, since Vercel has no always-on loop.
export const refresh_dispatch = release_old_offers;

const LOOP_EVERY_MS = 60 * 1000;

// Cleans up old one-rider offers once at start and then every minute. Safe on several servers: each change is conditional.
export function start_dispatch_loop() {
  const run = () => release_old_offers().catch((err) => console.warn('Releasing old offers failed:', err?.message || err));
  run();
  const timer = setInterval(run, LOOP_EVERY_MS);
  timer.unref();
  return timer;
}
