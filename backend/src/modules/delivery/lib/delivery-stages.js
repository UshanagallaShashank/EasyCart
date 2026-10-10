// The delivery steps an order goes through once a rider is involved, and the rules between them.
//   ready_for_delivery -> rider_assigned (offered, then accepted) -> dispatched (picked up) -> delivered
export const RIDER_STAGES = ['ready_for_delivery', 'rider_assigned', 'dispatched', 'delivered'];
export const ACTIVE_RIDER_STAGES = ['rider_assigned', 'dispatched'];

// A rider who has not been heard from for this long is treated as offline.
export const ONLINE_STALE_MS = 30 * 60 * 1000;
// How long a rider has to accept an offered order before it moves to the next nearest rider.
export const OFFER_SECONDS = 120;
// A rider can carry this many orders at once.
export const MAX_ACTIVE_ORDERS = 2;
// Riders further than this from the store are not offered its orders. Riders with no location yet are still tried, last.
export const MAX_DISPATCH_KM = 15;

// A motor vehicle needs a licence that has not expired; a bicycle needs none.
export function licence_problem(rider, today = new Date()) {
  if (rider.vehicle_type === 'bicycle' || !rider.license_expiry) return null;
  return new Date(`${rider.license_expiry}T23:59:59`) < today ? 'Your driving licence has expired. Add the renewed licence under Profile and ask support to update it.' : null;
}

export function is_rider_flow(order) {
  // "dispatched" alone is not enough: a store delivering with its own staff uses it too.
  return Boolean(order.rider_id) || ['ready_for_delivery', 'rider_assigned'].includes(order.fulfillment_status);
}

export function is_rider_available(rider, now = Date.now()) {
  if (rider.status !== 'approved' || !rider.is_online) return false;
  const seen = rider.last_seen_at ? new Date(rider.last_seen_at).getTime() : 0;
  return now - seen < ONLINE_STALE_MS;
}

export function is_offer_expired(order, now = Date.now()) {
  if (order.fulfillment_status !== 'rider_assigned' || order.rider_offer_status !== 'offered') return false;
  return Boolean(order.rider_offer_expires_at) && new Date(order.rider_offer_expires_at).getTime() <= now;
}

// The delivery step to show for an order: its fulfillment step, or "cancelled" once cancelled.
export function delivery_stage(order) {
  return order.status === 'cancelled' ? 'cancelled' : order.fulfillment_status;
}

// True once a rider has accepted the order; until then nobody is shown a rider who might still pass on it.
export function has_confirmed_rider(order) {
  return order.rider_offer_status === 'accepted' || ['dispatched', 'delivered'].includes(order.fulfillment_status);
}
