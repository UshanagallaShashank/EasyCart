// What a delivery costs, worked out the same way as the server's checkout: the shop's normal fee, or nothing once the
// order (after any coupon) reaches the shop's free-delivery amount. With no amount set, the normal fee always applies.
export function deliveryFeeFor(fee: number | null | undefined, freeAbove: number | null | undefined, orderValue: number) {
  const normal = Number(fee) || 0;
  if (!freeAbove || freeAbove <= 0) return normal;
  return orderValue >= freeAbove ? 0 : normal;
}
