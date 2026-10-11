// Refunds: the customer asks, the store decides, and the money goes back the way it came
// (online payments through the payment company, cash handed back by the store).
import { randomUUID } from 'node:crypto';
import { AppError } from '../../platform/shared/app-error.js';
import { publish_refund_change } from '../../platform/live/live-bus.js';
import { find_order_by_id, find_order_by_id_for_customer } from '../orders/repositories/order-repository.js';
import { find_orders_by_tenant } from '../orders/repositories/order-query-repository.js';
import { payment_provider } from '../payments/payment-config.js';
import { to_paise } from '../payments/payment-providers.js';
import { is_own_photo } from '../ratings/rating-math.js';
import { public_photo_prefix } from '../photos/customer-photo-service.js';
import { refund_decision_schema, refund_request_schema } from './refund-schemas.js';
import { refund_method, refund_request_problem, refundable_amount } from './refund-rules.js';
import {
  find_recent_refunds,
  find_refund_by_id,
  find_refunds_by_customer,
  find_refunds_by_order,
  find_refunds_by_tenant,
  save_refund,
  update_refund
} from './refund-repository.js';

function issues(parsed) {
  return parsed.error.issues.map((issue) => issue.message).join(', ');
}

// Lists are optional extras on a page: when refunds are not set up yet, they are simply empty.
async function or_empty(load) {
  try {
    return await load();
  } catch (err) {
    if (err instanceof AppError && (err.status_code === 503 || err.status_code === 501)) return [];
    throw err;
  }
}

export async function request_refund(customer_id, order_id, payload) {
  const parsed = refund_request_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues(parsed), 400);

  const order = await find_order_by_id_for_customer(order_id, customer_id);
  if (!order) throw new AppError('Order not found', 404);

  const refunds = await find_refunds_by_order(order_id);
  const problem = refund_request_problem(order, refunds, parsed.data.amount);
  if (problem) throw new AppError(problem, 400);

  const photo_urls = parsed.data.photo_urls ?? [];
  if (photo_urls.some((url) => !is_own_photo(url, { public_prefix: public_photo_prefix(), customer_id }))) {
    throw new AppError('Photos must be added from the app', 400);
  }

  const refund = await save_refund({
    id: randomUUID(),
    order_id,
    tenant_id: order.tenant_id,
    customer_id,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
    photo_urls,
    status: 'requested',
    method: refund_method(order)
  });
  publish_refund_change(refund);
  return refund;
}

export async function list_order_refunds(customer_id, order_id) {
  const order = await find_order_by_id_for_customer(order_id, customer_id);
  if (!order) throw new AppError('Order not found', 404);
  return or_empty(() => find_refunds_by_order(order_id));
}

export async function list_my_refunds(customer_id) {
  return or_empty(() => find_refunds_by_customer(customer_id));
}

// The store's refunds, each with a few facts about its order so the owner can decide without opening it.
export async function list_store_refunds(tenant_id) {
  const refunds = await or_empty(() => find_refunds_by_tenant(tenant_id));
  if (refunds.length === 0) return [];
  const orders = new Map((await find_orders_by_tenant(tenant_id)).map((order) => [order.id, order]));
  return refunds.map((refund) => {
    const order = orders.get(refund.order_id);
    return {
      ...refund,
      order: order ? { total: order.total, payment_method: order.payment_method, created_at: order.created_at, item_count: order.items.reduce((sum, item) => sum + item.quantity, 0) } : null
    };
  });
}

export async function list_all_refunds() {
  return or_empty(() => find_recent_refunds());
}

const decided = (user_id, note) => ({ decided_by: user_id, decision_note: note || null, decided_at: new Date().toISOString() });

// Sends the money back. Online payments go through the payment company; everything else was cash the store hands back.
async function pay_back(refund, order, user_id, note, manual) {
  if (refund.method === 'online' && !manual) {
    if (payment_provider.name === 'razorpay' && !order.payment_reference) {
      throw new AppError('This payment has no saved reference. Refund it from your Razorpay dashboard, then choose "I refunded it myself".', 409);
    }
    let refund_id;
    try {
      ({ refund_id } = await payment_provider.refund({ reference: order.payment_reference, amount: to_paise(refund.amount) }));
    } catch (err) {
      const failed = await update_refund(refund.id, { status: 'failed', ...decided(user_id, `The payment company refused the refund. ${note ?? ''}`.trim()) });
      publish_refund_change(failed);
      console.warn(`Refund ${refund.id} failed at the payment company:`, err?.message || err);
      throw new AppError('The payment company could not send the refund. Try again, or refund it from its dashboard.', 502);
    }
    const done = await update_refund(refund.id, { status: 'refunded', provider_refund_id: refund_id, ...decided(user_id, note) });
    publish_refund_change(done);
    return done;
  }

  const done = await update_refund(refund.id, { status: 'refunded', ...decided(user_id, note) });
  publish_refund_change(done);
  return done;
}

export async function decide_refund(tenant_id, user_id, refund_id, payload) {
  const parsed = refund_decision_schema.safeParse(payload);
  if (!parsed.success) throw new AppError(issues(parsed), 400);
  const { approve, note, manual } = parsed.data;

  const refund = await find_refund_by_id(refund_id);
  if (!refund || refund.tenant_id !== tenant_id) throw new AppError('Refund not found', 404);
  if (refund.status !== 'requested') throw new AppError('This refund was already decided', 409);

  if (!approve) {
    if (!note || note.length < 3) throw new AppError('Tell the customer why (at least 3 letters)', 400);
    const rejected = await update_refund(refund.id, { status: 'rejected', ...decided(user_id, note) });
    publish_refund_change(rejected);
    return rejected;
  }

  const order = await find_order_by_id(refund.order_id, tenant_id);
  if (!order) throw new AppError('Order not found', 404);
  return pay_back(refund, order, user_id, note, manual);
}

// The store cancelled an order the customer had already paid for: refund everything that is left, in one step.
export async function refund_cancelled_order(tenant_id, user_id, order_id, payload = {}) {
  const order = await find_order_by_id(order_id, tenant_id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== 'cancelled') throw new AppError('Only cancelled orders can be refunded this way', 400);
  if (order.payment_status !== 'paid') throw new AppError('This order was not paid, so there is nothing to refund', 400);

  const refunds = await find_refunds_by_order(order_id);
  if (refunds.some((refund) => refund.status === 'requested')) throw new AppError('The customer already asked for a refund. Decide it from Refunds.', 409);
  const amount = refundable_amount(order, refunds);
  if (amount <= 0) throw new AppError('This order has already been refunded in full', 409);

  const refund = await save_refund({
    id: randomUUID(),
    order_id,
    tenant_id,
    customer_id: order.customer_id,
    amount,
    reason: 'cancelled',
    details: 'The store cancelled the order',
    photo_urls: [],
    status: 'requested',
    method: refund_method(order)
  });
  return pay_back(refund, order, user_id, null, payload.manual === true);
}
