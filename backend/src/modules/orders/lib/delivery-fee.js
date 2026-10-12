// What a delivery costs the shopper. A shop can waive its fee once the order (after any coupon) reaches an amount it
// chooses; with no amount set, the normal fee always applies. Pure, so it is easy to test.
export function delivery_fee_for({ fee, free_above, order_value }) {
  const normal_fee = Number(fee) || 0;
  const threshold = free_above === null || free_above === undefined ? null : Number(free_above);
  if (threshold === null || !Number.isFinite(threshold) || threshold <= 0) return normal_fee;
  return order_value >= threshold ? 0 : normal_fee;
}
