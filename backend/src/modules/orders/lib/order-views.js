// What each side may see of an order. The customer's delivery code never reaches the store or the rider,
// and the store's pickup code never reaches the customer: each code proves a handover, so only one side holds it.
const PRIVATE_FIELDS = ['delivery_code', 'pickup_code', 'delivery_photo_path', 'declined_rider_ids'];

function without(order, fields) {
  if (!order) return order;
  const copy = { ...order };
  for (const field of fields) delete copy[field];
  delete copy._id;
  delete copy.__v;
  return copy;
}

export function to_owner_order(order) {
  return without(order, ['delivery_code', 'delivery_photo_path', 'declined_rider_ids']);
}

export function to_customer_order(order) {
  const view = without(order, ['pickup_code', 'pickup_code_attempts', 'delivery_photo_path', 'declined_rider_ids']);
  // The code is only useful while the order is on its way; afterwards it is hidden for good.
  if (order && (order.fulfillment_status === 'delivered' || order.status === 'cancelled')) view.delivery_code = null;
  return view;
}

export function to_admin_order(order) {
  return without(order, PRIVATE_FIELDS);
}
