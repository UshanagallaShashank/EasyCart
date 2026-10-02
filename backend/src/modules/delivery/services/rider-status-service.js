// Going online or offline and sharing the rider's current location.
import { AppError } from '../../../platform/shared/app-error.js';
import { update_rider } from '../repositories/rider-repository.js';
import { find_orders_by_rider, update_order_if } from '../repositories/delivery-order-repository.js';
import { online_schema, location_schema, issues_message } from '../delivery-schemas.js';
import { to_full_rider } from '../lib/rider-views.js';
import { licence_problem } from '../lib/delivery-stages.js';
import { get_rider_for_user } from './rider-application-service.js';
import { dispatch_order, refresh_dispatch } from './dispatch-service.js';

export async function set_my_online(user_id, payload) {
  const parsed = online_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  const rider = await get_rider_for_user(user_id);
  if (rider.status !== 'approved') throw new AppError('You can go online once an admin approves your application', 403);
  const expired = parsed.data.is_online ? licence_problem(rider) : null;
  if (expired) throw new AppError(expired, 403);

  const now = new Date().toISOString();
  const updates = { is_online: parsed.data.is_online, last_seen_at: now };
  if (parsed.data.latitude !== undefined && parsed.data.longitude !== undefined) {
    Object.assign(updates, { latitude: parsed.data.latitude, longitude: parsed.data.longitude, location_updated_at: now });
  }
  const updated = await update_rider(rider.id, updates);

  if (parsed.data.is_online) {
    await refresh_dispatch();
  } else {
    await release_offers(rider.id);
  }
  return to_full_rider(updated);
}

export async function update_my_location(user_id, payload) {
  const parsed = location_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues_message(parsed.error), 400);
  const rider = await get_rider_for_user(user_id);
  const now = new Date().toISOString();
  await update_rider(rider.id, { ...parsed.data, location_updated_at: now, last_seen_at: now }, { silent: true });
  return { ok: true };
}

// Offers a rider has not answered go straight to the next nearest rider (when they go offline or are suspended).
export async function release_offers(rider_id) {
  const offers = (await find_orders_by_rider(rider_id)).filter((order) => order.rider_offer_status === 'offered' && order.fulfillment_status === 'rider_assigned');
  for (const order of offers) {
    const released = await update_order_if(order.id, { rider_id, rider_offer_status: 'offered' }, {
      fulfillment_status: 'ready_for_delivery', rider_id: null, rider_offer_status: null, rider_offer_expires_at: null,
      declined_rider_ids: [...(order.declined_rider_ids ?? []), rider_id]
    });
    if (released) await dispatch_order(released);
  }
}
