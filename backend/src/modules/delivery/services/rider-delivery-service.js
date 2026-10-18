// The rider's side of a delivery: see the open orders nearby and take one (first come, first served), or pass on it, prove pickup with the store's code,
// and prove the handover with the customer's code, a photo and the cash collected.
import { AppError } from '../../../platform/shared/app-error.js';
import { find_store_by_tenant_id } from '../../stores/repositories/store-repository.js';
import { find_user_by_id } from '../../users/repositories/user-repository.js';
import { find_settlements_by_rider } from '../repositories/settlement-repository.js';
import { find_order_by_id_any_store, find_orders_by_rider, update_order_if } from '../repositories/delivery-order-repository.js';
import { pickup_schema, deliver_schema, issues_message } from '../delivery-schemas.js';
import { MAX_CODE_ATTEMPTS, code_matches } from '../lib/delivery-codes.js';
import { haversine_km } from '../lib/haversine-km.js';
import { MAX_ACTIVE_ORDERS } from '../lib/delivery-stages.js';
import { summarize_rider_money, rider_daily_series } from '../lib/summarize-rider-money.js';
import { to_full_rider } from '../lib/rider-views.js';
import { get_rider_for_user } from './rider-application-service.js';
import { check_rider_can_take, find_open_orders_for, release_old_offers, rider_passed_on, store_point } from './dispatch-service.js';
import { mark_rider_seen } from './rider-status-service.js';
import { save_delivery_file, delivery_file_url } from './delivery-file-service.js';
import { calculate_order_settlement } from './order-settlement-service.js';

function item_count(order) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

function stage_of(order) {
  if (order.status === 'cancelled') return 'cancelled';
  // Packed and not taken by anyone yet: an open order any nearby rider can accept.
  if (order.fulfillment_status === 'ready_for_delivery' && !order.rider_id) return 'offered';
  if (order.fulfillment_status === 'rider_assigned') return order.rider_offer_status === 'offered' ? 'offered' : 'to_pickup';
  if (order.fulfillment_status === 'dispatched') return 'to_customer';
  return order.fulfillment_status;
}

// What the rider sees of an order. The customer's address and phone appear only once the rider has accepted it,
// and neither handover code is ever included.
async function to_rider_order(order, rider) {
  const accepted = order.rider_offer_status === 'accepted';
  const [store, customer] = await Promise.all([
    find_store_by_tenant_id(order.tenant_id),
    accepted ? find_user_by_id(order.customer_id) : Promise.resolve(null)
  ]);
  const store_location = store_point(store);
  return {
    id: order.id,
    stage: stage_of(order),
    created_at: order.created_at,
    // When the store packed it. Open orders show this so a rider can tell them apart.
    ready_at: order.ready_at ?? null,
    offer_expires_at: order.rider_offer_status === 'offered' ? order.rider_offer_expires_at : null,
    store: {
      name: store?.name ?? 'Store',
      address: store?.address ?? null,
      latitude: store_location?.latitude ?? null,
      longitude: store_location?.longitude ?? null,
      distance_km: store_location ? Math.round((haversine_km(rider, store_location) ?? 0) * 10) / 10 : null
    },
    customer: accepted ? { name: customer?.username ?? 'Customer', phone_number: customer?.phone_number ?? null } : null,
    delivery_address: accepted ? order.delivery_address : null,
    items: accepted ? order.items.map(({ name, quantity, variant_label }) => ({ name, quantity, variant_label: variant_label ?? null })) : [],
    item_count: item_count(order),
    subtotal: order.items.reduce((total, item) => total + item.price * item.quantity, 0),
    discount_amount: order.discount_amount ?? 0,
    delivery_fee: order.delivery_fee ?? 0,
    total: order.total,
    cash_to_collect: order.payment_status === 'paid' ? 0 : order.total,
    earning: order.rider_earning ?? order.delivery_fee ?? 0,
    pickup_attempts_left: Math.max(0, MAX_CODE_ATTEMPTS - (order.pickup_code_attempts ?? 0)),
    delivery_attempts_left: Math.max(0, MAX_CODE_ATTEMPTS - (order.delivery_code_attempts ?? 0)),
    accepted_at: order.accepted_at ?? null,
    picked_up_at: order.picked_up_at ?? null,
    delivered_at: order.delivered_at ?? null,
    cash_collected: order.cash_collected ?? null,
    proof_photo_url: order.delivery_photo_path ? await delivery_file_url(order.delivery_photo_path) : null,
    settlement: calculate_order_settlement(order)
  };
}

async function find_my_order(rider, order_id) {
  const order = await find_order_by_id_any_store(order_id);
  if (!order || order.rider_id !== rider.id) throw new AppError('Order not found', 404);
  return order;
}

export async function get_rider_home(user_id) {
  const rider = await mark_rider_seen(await get_rider_for_user(user_id));
  // No order is ever held for just one rider: any such order goes back to the list every rider sees, before reading it.
  await release_old_offers();
  const [orders, settlements, open] = await Promise.all([find_orders_by_rider(rider.id), find_settlements_by_rider(rider.id), find_open_orders_for(rider)]);
  // Orders this rider accepted and has not finished.
  const mine = orders.filter((order) => order.status !== 'cancelled' && ['rider_assigned', 'dispatched'].includes(order.fulfillment_status) && order.rider_offer_status !== 'offered');
  return {
    rider: await to_full_rider(rider),
    offers: await Promise.all(open.filter((order) => !rider_passed_on(rider, order)).map((order) => to_rider_order(order, rider))),
    // Orders this rider passed on that nobody has taken yet. Shown in their own section; the rider can still take one.
    passed: await Promise.all(open.filter((order) => rider_passed_on(rider, order)).map((order) => to_rider_order(order, rider))),
    active: await Promise.all(mine.map((order) => to_rider_order(order, rider))),
    // True when the rider carries as many orders as allowed, so new orders are hidden until they deliver one.
    at_order_limit: mine.length >= MAX_ACTIVE_ORDERS,
    max_active_orders: MAX_ACTIVE_ORDERS,
    summary: summarize_rider_money(orders, settlements)
  };
}

// An order the rider has taken, or an open order they could still take.
export async function get_rider_order(user_id, order_id) {
  const rider = await get_rider_for_user(user_id);
  const order = await find_order_by_id_any_store(order_id);
  if (order && order.rider_id === rider.id) return to_rider_order(order, rider);
  const problem = await check_rider_can_take(rider, order);
  if (problem === null) return to_rider_order(order, rider);
  throw new AppError('Order not found', 404);
}

export async function list_rider_history(user_id) {
  const rider = await get_rider_for_user(user_id);
  const orders = (await find_orders_by_rider(rider.id)).filter((order) => order.fulfillment_status === 'delivered');
  return Promise.all(orders.map((order) => to_rider_order(order, rider)));
}

export async function get_rider_earnings(user_id) {
  const rider = await get_rider_for_user(user_id);
  const [orders, settlements] = await Promise.all([find_orders_by_rider(rider.id), find_settlements_by_rider(rider.id)]);
  return { summary: summarize_rider_money(orders, settlements), daily: rider_daily_series(orders), settlements };
}

// New work only goes to riders in good standing. A rider suspended mid-delivery can still finish handing over what they carry.
function assert_can_take_work(rider) {
  if (rider.status !== 'approved') throw new AppError('Your account cannot take orders right now', 403);
}

// First come, first served: the update only succeeds while nobody has the order yet,
// so when two riders press Accept at the same moment, exactly one of them gets it.
export async function accept_offer(user_id, order_id) {
  const rider = await get_rider_for_user(user_id);
  assert_can_take_work(rider);
  const order = await find_order_by_id_any_store(order_id);
  // Already this rider's (a double tap, or an order offered to just them): accepting again simply confirms it.
  if (order && order.rider_id === rider.id && order.status !== 'cancelled') return accept_my_order(order, rider);
  const problem = await check_rider_can_take(rider, order);
  if (problem) throw new AppError(problem, 409);
  const taken = await update_order_if(order.id, { fulfillment_status: 'ready_for_delivery', rider_id: null }, {
    fulfillment_status: 'rider_assigned',
    rider_id: rider.id,
    rider_offer_status: 'accepted',
    rider_offer_expires_at: null,
    accepted_at: new Date().toISOString()
  });
  if (!taken) throw new AppError('Another rider already took this order', 409);
  return to_rider_order(taken, rider);
}

async function accept_my_order(order, rider) {
  if (order.rider_offer_status !== 'offered') return to_rider_order(order, rider);
  const accepted = await update_order_if(order.id, { rider_id: rider.id, rider_offer_status: 'offered' }, {
    rider_offer_status: 'accepted', rider_offer_expires_at: null, accepted_at: new Date().toISOString()
  });
  return to_rider_order(accepted ?? order, rider);
}

// Hides an open order from this rider. Other riders still see it.
export async function decline_offer(user_id, order_id) {
  const rider = await get_rider_for_user(user_id);
  const order = await find_order_by_id_any_store(order_id);
  const declined = order?.declined_rider_ids ?? [];
  // An order offered to just this rider goes back to every nearby rider, minus this one.
  if (order && order.rider_id === rider.id && order.rider_offer_status === 'offered') {
    await update_order_if(order.id, { rider_id: rider.id, rider_offer_status: 'offered' }, {
      fulfillment_status: 'ready_for_delivery', rider_id: null, rider_offer_status: null, rider_offer_expires_at: null,
      declined_rider_ids: declined.includes(rider.id) ? declined : [...declined, rider.id]
    });
    return { ok: true };
  }
  if (!order || order.fulfillment_status !== 'ready_for_delivery' || order.rider_id) {
    throw new AppError('Only new orders can be declined. Ask the store to cancel an accepted delivery.', 400);
  }
  if (!declined.includes(rider.id)) {
    await update_order_if(order.id, { fulfillment_status: 'ready_for_delivery', rider_id: null }, { declined_rider_ids: [...declined, rider.id] });
  }
  return { ok: true };
}

// A rider who accepted can give the order back before collecting it. It goes straight back to every
// nearby rider (not this one again), so the store does not have to do anything.
export async function drop_delivery(user_id, order_id) {
  const rider = await get_rider_for_user(user_id);
  const order = await find_my_order(rider, order_id);
  if (order.fulfillment_status !== 'rider_assigned' || order.rider_offer_status !== 'accepted') {
    throw new AppError('You can only give back an order before you pick it up from the store', 400);
  }
  const declined = order.declined_rider_ids ?? [];
  const released = await update_order_if(order.id, { rider_id: rider.id, fulfillment_status: 'rider_assigned' }, {
    fulfillment_status: 'ready_for_delivery',
    rider_id: null,
    rider_offer_status: null,
    rider_offer_expires_at: null,
    accepted_at: null,
    declined_rider_ids: declined.includes(rider.id) ? declined : [...declined, rider.id]
  });
  if (!released) throw new AppError('This order changed. Refresh and try again.', 409);
  return { ok: true };
}

// Counts a wrong code, and refuses outright once the limit is reached.
async function check_code({ order, field, attempts_field, provided, who }) {
  const attempts = order[attempts_field] ?? 0;
  if (attempts >= MAX_CODE_ATTEMPTS) {
    throw new AppError(`Too many wrong codes. Ask the ${who} to issue a new code.`, 423);
  }
  if (!order[field] || !code_matches(provided, order[field])) {
    await update_order_if(order.id, { id: order.id }, { [attempts_field]: attempts + 1 });
    const left = MAX_CODE_ATTEMPTS - attempts - 1;
    throw new AppError(left > 0 ? `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.` : `Wrong code. Ask the ${who} to issue a new code.`, 400);
  }
}

export async function confirm_pickup(user_id, order_id, payload) {
  const parsed = pickup_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  const rider = await get_rider_for_user(user_id);
  assert_can_take_work(rider);
  const order = await find_my_order(rider, order_id);
  if (order.status === 'cancelled') throw new AppError('This order was cancelled', 409);
  if (order.fulfillment_status !== 'rider_assigned' || order.rider_offer_status !== 'accepted') throw new AppError('Accept the order before picking it up', 400);

  await check_code({ order, field: 'pickup_code', attempts_field: 'pickup_code_attempts', provided: parsed.data.pickup_code, who: 'store' });
  const picked = await update_order_if(order.id, { rider_id: rider.id, fulfillment_status: 'rider_assigned' }, {
    fulfillment_status: 'dispatched', picked_up_at: new Date().toISOString(), status: order.status === 'pending' ? 'confirmed' : order.status
  });
  if (!picked) throw new AppError('This order changed. Refresh and try again.', 409);
  return to_rider_order(picked, rider);
}

export async function complete_delivery(user_id, order_id, payload) {
  const parsed = deliver_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  const rider = await get_rider_for_user(user_id);
  const order = await find_my_order(rider, order_id);
  if (order.status === 'cancelled') throw new AppError('This order was cancelled', 409);
  if (order.fulfillment_status !== 'dispatched') throw new AppError('Pick the order up from the store first', 400);

  await check_code({ order, field: 'delivery_code', attempts_field: 'delivery_code_attempts', provided: parsed.data.delivery_code, who: 'customer' });

  const cash_due = order.payment_status === 'paid' ? 0 : Number(order.total);
  if (Math.abs(parsed.data.cash_collected - cash_due) > 0.009) {
    throw new AppError(`Collect exactly Rs. ${cash_due.toFixed(2)} from the customer`, 400);
  }

  const photo_path = await save_delivery_file({ folder: `orders/${order.id}`, kind: 'delivery_proof', file: parsed.data.photo });
  const delivered = await update_order_if(order.id, { rider_id: rider.id, fulfillment_status: 'dispatched' }, {
    fulfillment_status: 'delivered',
    status: 'fulfilled',
    payment_status: 'paid',
    delivered_at: new Date().toISOString(),
    delivery_photo_path: photo_path,
    cash_collected: cash_due,
    rider_earning: Number(order.delivery_fee ?? 0)
  });
  if (!delivered) throw new AppError('This order changed. Refresh and try again.', 409);
  return to_rider_order(delivered, rider);
}
