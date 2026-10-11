// Going online or offline and sharing the rider's current location.
import { AppError } from '../../../platform/shared/app-error.js';
import { update_rider } from '../repositories/rider-repository.js';
import { find_orders_by_rider } from '../repositories/delivery-order-repository.js';
import { online_schema, location_schema, issues_message } from '../delivery-schemas.js';
import { to_full_rider } from '../lib/rider-views.js';
import { licence_problem } from '../lib/delivery-stages.js';
import { get_rider_for_user } from './rider-application-service.js';
import { release_offer } from './dispatch-service.js';

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

  if (!parsed.data.is_online) await release_offers(rider.id);
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

// Any old one-rider offer still waiting on this rider goes back to the open list (when they go offline or are suspended).
export async function release_offers(rider_id) {
  const offers = (await find_orders_by_rider(rider_id)).filter((order) => order.rider_offer_status === 'offered' && order.fulfillment_status === 'rider_assigned');
  for (const order of offers) await release_offer(order);
}

// The rider's app checks for orders every 30 seconds on any screen. While they are online, each check counts
// as "still here", so a rider whose GPS fails or who is on another screen keeps seeing new orders.
export async function mark_rider_seen(rider) {
  if (!rider.is_online) return rider;
  return update_rider(rider.id, { last_seen_at: new Date().toISOString() }, { silent: true });
}
