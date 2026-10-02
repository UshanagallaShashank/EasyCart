// The pin the customer dropped on the map for a delivery order, or null when they did not drop one.
export function order_point(order) {
  if (order.delivery_latitude === null || order.delivery_latitude === undefined) return null;
  return { latitude: Number(order.delivery_latitude), longitude: Number(order.delivery_longitude) };
}
