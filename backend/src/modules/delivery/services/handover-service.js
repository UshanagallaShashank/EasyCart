// What the store and the customer see about the delivery of their order, and the store's delivery actions.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_order_by_id, find_order_by_id_for_customer, update_order } from '../../orders/repositories/order-repository.js';
import { find_orders_by_tenant } from '../../orders/repositories/order-query-repository.js';
import { find_store_by_tenant_id } from '../../stores/repositories/store-repository.js';
import { find_rider_by_id, find_riders_by_ids, find_riders_by_status } from '../repositories/rider-repository.js';
import { find_orders_by_riders } from '../repositories/delivery-order-repository.js';
import { create_delivery_code, create_pickup_code, MAX_CODE_ATTEMPTS } from '../lib/delivery-codes.js';
import { ACTIVE_RIDER_STAGES, delivery_stage, has_confirmed_rider, is_rider_available } from '../lib/delivery-stages.js';
import { sort_riders_by_distance } from '../lib/sort-riders-by-distance.js';
import { estimate_arrival } from '../lib/estimate-arrival.js';
import { to_handover_rider } from '../lib/rider-views.js';
import { dispatch_order, store_point } from './dispatch-service.js';
import { order_point } from '../lib/order-point.js';
import { delivery_file_url } from './delivery-file-service.js';
import { calculate_order_settlement } from './order-settlement-service.js';

function timeline(order) {
  return {
    placed_at: order.created_at,
    ready_at: order.ready_at ?? null,
    accepted_at: order.accepted_at ?? null,
    picked_up_at: order.picked_up_at ?? null,
    delivered_at: order.delivered_at ?? null
  };
}

async function base_delivery(order) {
  const rider = order.rider_id ? await find_rider_by_id(order.rider_id) : null;
  const accepted = has_confirmed_rider(order);

  // While the rider is heading to the store, show how far they are and roughly how long they need.
  // (After pickup there is no customer location on record, so no arrival time is shown for that last leg.)
  const heading_to_store = order.fulfillment_status === 'rider_assigned' && order.rider_offer_status === 'accepted';
  const store = heading_to_store ? await find_store_by_tenant_id(order.tenant_id) : null;
  const pickup_eta = heading_to_store ? estimate_arrival(rider, store_point(store)) : null;

  // On the last leg, the same from the rider's position to the customer's pin (only if the customer dropped one).
  const on_the_way = order.fulfillment_status === 'dispatched' && order.status !== 'cancelled';
  const dropoff_eta = on_the_way ? estimate_arrival(rider, order_point(order)) : null;

  return {
    order_id: order.id,
    stage: delivery_stage(order),
    rider_offer_status: order.rider_offer_status ?? null,
    // Only a rider who accepted is shown, so nobody sees a rider who may still pass on the order.
    rider: accepted ? await to_handover_rider(rider, { include_phone: order.fulfillment_status !== 'delivered' }) : null,
    timeline: timeline(order),
    pickup_eta,
    dropoff_eta,
    cash_collected: order.cash_collected ?? null,
    proof_photo_url: order.delivery_photo_path ? await delivery_file_url(order.delivery_photo_path) : null
  };
}

async function find_store_order(tenant_id, order_id) {
  const order = await find_order_by_id(order_id, tenant_id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.fulfillment_method !== 'delivery') throw new AppError('This is a pickup order', 400);
  return order;
}

export async function get_store_order_delivery(tenant_id, order_id) {
  const order = await find_store_order(tenant_id, order_id);
  const store = await find_store_by_tenant_id(tenant_id);
  return {
    ...(await base_delivery(order)),
    // The store hands this to the rider at the counter; the rider cannot mark pickup without it.
    pickup_code: ['ready_for_delivery', 'rider_assigned'].includes(order.fulfillment_status) ? order.pickup_code : null,
    pickup_locked: (order.pickup_code_attempts ?? 0) >= MAX_CODE_ATTEMPTS,
    delivery_locked: (order.delivery_code_attempts ?? 0) >= MAX_CODE_ATTEMPTS,
    store_has_location: Boolean(store_point(store)),
    // How many riders passed on (or let the offer run out). Shown so the store knows to search again.
    declined_count: (order.declined_rider_ids ?? []).length,
    settlement: calculate_order_settlement(order)
  };
}

// The store says the order is packed: a pickup code is made and the nearest free rider gets the offer.
// Calling it again while waiting starts a fresh search, including riders who passed before.
export async function request_rider(tenant_id, order_id) {
  const order = await find_store_order(tenant_id, order_id);
  if (order.status === 'cancelled') throw new AppError('This order was cancelled', 400);
  if (order.status === 'fulfilled') throw new AppError('This order is already complete', 400);
  if (!['not_started', 'ready_for_delivery'].includes(order.fulfillment_status)) throw new AppError('A rider is already handling this order', 400);

  const ready = await update_order(order.id, tenant_id, {
    fulfillment_status: 'ready_for_delivery',
    status: order.status === 'pending' ? 'confirmed' : order.status,
    ready_at: order.ready_at ?? new Date().toISOString(),
    pickup_code: order.pickup_code ?? create_pickup_code(),
    pickup_code_attempts: 0,
    declined_rider_ids: [],
    rider_id: null,
    rider_offer_status: null,
    rider_offer_expires_at: null,
    delivery_code: order.delivery_code ?? create_delivery_code()
  });
  await dispatch_order(ready);
  return get_store_order_delivery(tenant_id, order_id);
}

// Takes the order back from riders before pickup, for example to deliver it with the store's own staff.
export async function cancel_rider_request(tenant_id, order_id) {
  const order = await find_store_order(tenant_id, order_id);
  if (!['ready_for_delivery', 'rider_assigned'].includes(order.fulfillment_status)) throw new AppError('The rider already has this order', 400);
  await update_order(order.id, tenant_id, { fulfillment_status: 'not_started', rider_id: null, rider_offer_status: null, rider_offer_expires_at: null, pickup_code: null, accepted_at: null }, order.rider_id);
  return get_store_order_delivery(tenant_id, order_id);
}

export async function reissue_pickup_code(tenant_id, order_id) {
  const order = await find_store_order(tenant_id, order_id);
  if (order.status === 'cancelled') throw new AppError('This order was cancelled', 400);
  if (!['ready_for_delivery', 'rider_assigned'].includes(order.fulfillment_status)) throw new AppError('The order has already been picked up', 400);
  await update_order(order.id, tenant_id, { pickup_code: create_pickup_code(), pickup_code_attempts: 0 });
  return get_store_order_delivery(tenant_id, order_id);
}

// Gives the customer a new delivery code (they see it on their order page) after too many wrong tries.
export async function reissue_delivery_code(tenant_id, order_id) {
  const order = await find_store_order(tenant_id, order_id);
  if (order.fulfillment_status === 'delivered' || order.status === 'cancelled') throw new AppError('This order is closed', 400);
  await update_order(order.id, tenant_id, { delivery_code: create_delivery_code(), delivery_code_attempts: 0 });
  return get_store_order_delivery(tenant_id, order_id);
}

export async function get_customer_order_delivery(customer_id, order_id) {
  const order = await find_order_by_id_for_customer(order_id, customer_id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.fulfillment_method !== 'delivery') throw new AppError('This is a pickup order', 400);
  const open = order.status !== 'cancelled' && order.fulfillment_status !== 'delivered';
  return {
    ...(await base_delivery(order)),
    delivery_code: open ? order.delivery_code : null,
    delivery_locked: (order.delivery_code_attempts ?? 0) >= MAX_CODE_ATTEMPTS
  };
}

// Approved riders nearest the store first, with whether they could take an order right now.
export async function list_riders_near_store(tenant_id) {
  const [store, riders] = await Promise.all([find_store_by_tenant_id(tenant_id), find_riders_by_status('approved')]);
  const orders = await find_orders_by_riders(riders.map((rider) => rider.id));
  const busy = new Map();
  for (const order of orders) {
    if (order.status !== 'cancelled' && ACTIVE_RIDER_STAGES.includes(order.fulfillment_status)) busy.set(order.rider_id, (busy.get(order.rider_id) ?? 0) + 1);
  }
  const origin = store_point(store);
  return {
    store_location: origin ? { ...origin, address: store.address ?? null } : null,
    riders: sort_riders_by_distance(riders, origin).map((rider) => ({
      id: rider.id,
      full_name: rider.full_name,
      vehicle_type: rider.vehicle_type,
      area: rider.area,
      city: rider.city,
      distance_km: rider.distance_km,
      is_available: is_rider_available(rider),
      active_orders: busy.get(rider.id) ?? 0
    }))
  };
}

// The store's delivery orders with who is carrying each one.
export async function list_store_deliveries(tenant_id) {
  const orders = (await find_orders_by_tenant(tenant_id)).filter((order) => order.fulfillment_method === 'delivery');
  const riders = await find_riders_by_ids([...new Set(orders.map((order) => order.rider_id).filter(Boolean))]);
  const rider_names = new Map(riders.map((rider) => [rider.id, rider.full_name]));
  return orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((order) => ({
      id: order.id,
      stage: delivery_stage(order),
      rider_offer_status: order.rider_offer_status ?? null,
      rider_name: has_confirmed_rider(order) ? rider_names.get(order.rider_id) ?? null : null,
      delivery_address: order.delivery_address,
      total: order.total,
      created_at: order.created_at,
      delivered_at: order.delivered_at ?? null,
      settlement: calculate_order_settlement(order)
    }));
}
