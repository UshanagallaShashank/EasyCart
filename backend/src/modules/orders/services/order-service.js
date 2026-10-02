import { randomUUID } from 'node:crypto';
import { AppError } from '../../../platform/shared/app-error.js';
import {
  validate_order_status_input,
  validate_fulfillment_status_input,
  validate_assignment_input,
  is_valid_fulfillment_status_for_method
} from '../order-schemas.js';
import { validate_payment_status_input } from '../payment-schemas.js';
import { process_payment } from './payment-service.js';
import { adjust_stock } from '../../products/services/product-service.js';
import { notify_order_placed } from '../../notifications/services/notification-service.js';
import { find_order_by_id, find_order_by_id_for_customer, save_order, update_order } from '../repositories/order-repository.js';
import { find_orders_by_tenant, find_orders_by_customer } from '../repositories/order-query-repository.js';
import { find_stores_by_tenant_ids } from '../../stores/repositories/store-repository.js';
import { pick_customer_stores } from '../lib/pick-customer-stores.js';
import { to_owner_order, to_customer_order } from '../lib/order-views.js';
import { create_delivery_code } from '../../delivery/lib/delivery-codes.js';
import { is_rider_flow } from '../../delivery/lib/delivery-stages.js';

export async function create_order(
  tenant_id,
  customer_id,
  { items, total, payment_method, fulfillment_method, delivery_address, delivery_fee, coupon_code, discount_amount }
) {
  const order = await save_order({
    id: randomUUID(),
    tenant_id,
    customer_id,
    items,
    total,
    status: 'pending',
    payment_status: 'unpaid',
    payment_method,
    fulfillment_method,
    delivery_address,
    delivery_fee,
    fulfillment_status: 'not_started',
    assigned_to: null,
    // Only the customer sees this code; the rider must type it in to complete the delivery.
    delivery_code: fulfillment_method === 'delivery' ? create_delivery_code() : null,
    coupon_code: coupon_code ?? null,
    discount_amount: discount_amount ?? 0
  });
  await process_payment(order, payment_method);
  for (const item of items) {
    await adjust_stock(tenant_id, item.product_id, -item.quantity);
  }
  await notify_order_placed(tenant_id, order);
  return to_customer_order(order);
}

export async function list_orders_for_tenant(tenant_id) {
  return (await find_orders_by_tenant(tenant_id)).map(to_owner_order);
}

export async function list_orders_for_customer(customer_id) {
  return (await find_orders_by_customer(customer_id)).map(to_customer_order);
}

// The stores this customer shops at (the ones they have ordered from), used to send them to the right store after sign-in.
export async function list_stores_for_customer(customer_id) {
  const orders = await find_orders_by_customer(customer_id);
  const tenant_ids = [...new Set(orders.map((order) => order.tenant_id))];
  const stores = await find_stores_by_tenant_ids(tenant_ids);
  return pick_customer_stores(orders, stores);
}

async function find_tenant_order(tenant_id, id) {
  const order = await find_order_by_id(id, tenant_id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
}

async function find_customer_order(customer_id, id) {
  const order = await find_order_by_id_for_customer(id, customer_id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
}

export async function get_order_for_tenant(tenant_id, id) {
  return to_owner_order(await find_tenant_order(tenant_id, id));
}

export async function get_order_for_customer(customer_id, id) {
  return to_customer_order(await find_customer_order(customer_id, id));
}

// Cancelling an order takes it off its rider, so the rider is free for the next one.
const RELEASE_RIDER = { rider_id: null, rider_offer_status: null, rider_offer_expires_at: null };

export async function update_order_status(tenant_id, id, payload) {
  const parsed = validate_order_status_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const order = await find_tenant_order(tenant_id, id);
  if (order.fulfillment_status === 'delivered' && parsed.data.status === 'cancelled') {
    throw new AppError('A delivered order cannot be cancelled', 400);
  }
  const updates = parsed.data.status === 'cancelled' && order.rider_id ? { ...parsed.data, ...RELEASE_RIDER } : parsed.data;
  return to_owner_order(await update_order(id, tenant_id, updates));
}

export async function update_order_payment_status(tenant_id, id, payload) {
  const parsed = validate_payment_status_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const order = await find_tenant_order(tenant_id, id);
  if (is_rider_flow(order)) {
    throw new AppError('The rider marks this order paid when they collect the cash', 400);
  }
  return to_owner_order(await update_order(id, tenant_id, parsed.data));
}

export async function update_order_fulfillment_status(tenant_id, id, payload) {
  const parsed = validate_fulfillment_status_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const order = await find_tenant_order(tenant_id, id);
  if (!is_valid_fulfillment_status_for_method(order.fulfillment_method, parsed.data.fulfillment_status)) {
    throw new AppError(`Invalid fulfillment status for a ${order.fulfillment_method} order`, 400);
  }
  // Once a rider is involved, only the rider's pickup and delivery checks move the order forward.
  if (is_rider_flow(order)) {
    throw new AppError('A delivery partner is handling this order. Its status updates as they pick it up and deliver it.', 400);
  }
  return to_owner_order(await update_order(id, tenant_id, parsed.data));
}

export async function update_order_assignment(tenant_id, id, payload) {
  const parsed = validate_assignment_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await find_tenant_order(tenant_id, id);
  return to_owner_order(await update_order(id, tenant_id, parsed.data));
}

export async function cancel_order_for_customer(customer_id, id) {
  const order = await find_customer_order(customer_id, id);
  if (order.status !== 'pending' || order.fulfillment_status !== 'not_started') {
    throw new AppError('Only pending orders that are not yet being prepared can be cancelled', 400);
  }
  const cancelled = await update_order(id, order.tenant_id, { status: 'cancelled' });
  for (const item of order.items) {
    await adjust_stock(order.tenant_id, item.product_id, item.quantity);
  }
  return to_customer_order(cancelled);
}
