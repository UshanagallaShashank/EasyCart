// The rules for refunds, as plain functions with no database, so they are easy to read and test.

export const REFUND_REASONS = ['damaged', 'missing', 'wrong_item', 'quality', 'cancelled', 'other'];
const REFUND_WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const round2 = (number) => Math.round(number * 100) / 100;

// How much of the order can still be asked for: what was paid, minus refunds that are done or waiting.
export function refundable_amount(order, refunds) {
  const used = refunds
    .filter((refund) => refund.status === 'refunded' || refund.status === 'requested')
    .reduce((sum, refund) => sum + Number(refund.amount), 0);
  return round2(Math.max(0, Number(order.total) - used));
}

// Why the customer may not ask for this refund, or null when they may.
export function refund_request_problem(order, refunds, amount, now = new Date()) {
  if (order.payment_status !== 'paid') return 'Only orders that were paid can be refunded';
  if (order.status !== 'fulfilled' && order.status !== 'cancelled') return 'You can ask for a refund once the order is delivered or cancelled';
  if (refunds.some((refund) => refund.status === 'requested')) return 'A refund for this order is already waiting for the store';

  const left = refundable_amount(order, refunds);
  if (left <= 0) return 'This order has already been refunded in full';
  if (!(amount > 0)) return 'Enter an amount above 0';
  if (amount > left) return `You can ask for up to Rs. ${left.toFixed(2)}`;

  const since = new Date(order.delivered_at ?? order.updated_at ?? order.created_at);
  if (now.getTime() - since.getTime() > REFUND_WINDOW_DAYS * DAY_MS) return `Refunds can be asked for within ${REFUND_WINDOW_DAYS} days`;
  return null;
}

// Online payments go back the way they came; cash is handed back by the store.
export function refund_method(order) {
  return order.payment_method === 'online' ? 'online' : 'cash';
}
