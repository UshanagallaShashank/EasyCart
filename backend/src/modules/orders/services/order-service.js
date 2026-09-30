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
    coupon_code: coupon_code ?? null,
    discount_amount: discount_amount ?? 0
  });
  await process_payment(order, payment_method);
  for (const item of items) {
    await adjust_stock(tenant_id, item.product_id, -item.quantity);
  }
  await notify_order_placed(tenant_id, order);
  return order;
}

export async function list_orders_for_tenant(tenant_id) {
  return find_orders_by_tenant(tenant_id);
}

export async function list_orders_for_customer(customer_id) {
  return find_orders_by_customer(customer_id);
}

export async function get_order_for_tenant(tenant_id, id) {
  const order = await find_order_by_id(id, tenant_id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
}

export async function get_order_for_customer(customer_id, id) {
  const order = await find_order_by_id_for_customer(id, customer_id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  return order;
}

export async function update_order_status(tenant_id, id, payload) {
  const parsed = validate_order_status_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await get_order_for_tenant(tenant_id, id);
  return update_order(id, tenant_id, parsed.data);
}

export async function update_order_payment_status(tenant_id, id, payload) {
  const parsed = validate_payment_status_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await get_order_for_tenant(tenant_id, id);
  return update_order(id, tenant_id, parsed.data);
}

export async function update_order_fulfillment_status(tenant_id, id, payload) {
  const parsed = validate_fulfillment_status_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  const order = await get_order_for_tenant(tenant_id, id);
  if (!is_valid_fulfillment_status_for_method(order.fulfillment_method, parsed.data.fulfillment_status)) {
    throw new AppError(`Invalid fulfillment status for a ${order.fulfillment_method} order`, 400);
  }
  return update_order(id, tenant_id, parsed.data);
}

export async function update_order_assignment(tenant_id, id, payload) {
  const parsed = validate_assignment_input(payload);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues.map((issue) => issue.message).join(', '), 400);
  }
  await get_order_for_tenant(tenant_id, id);
  return update_order(id, tenant_id, parsed.data);
}
