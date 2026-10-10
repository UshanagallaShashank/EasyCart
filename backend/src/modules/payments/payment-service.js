// Starting and confirming an online payment for an order that is already placed.
import { AppError } from '../../platform/shared/app-error.js';
import { ONLINE_PAYMENTS_ENABLED } from '../../env.js';
import { find_order_by_id_for_customer, update_order } from '../orders/repositories/order-repository.js';
import { payment_provider } from './payment-config.js';

async function find_payable_order(customer_id, order_id) {
  if (!ONLINE_PAYMENTS_ENABLED) throw new AppError('Online payment is not available right now', 400);
  const order = await find_order_by_id_for_customer(order_id, customer_id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.payment_method !== 'online') throw new AppError('This order is paid in cash', 400);
  if (order.status === 'cancelled') throw new AppError('This order was cancelled', 400);
  if (order.payment_status === 'paid') throw new AppError('This order is already paid', 409);
  return order;
}

export async function start_online_payment(customer_id, order_id) {
  const order = await find_payable_order(customer_id, order_id);
  return payment_provider.start(order);
}

// Saves the payment reference too when the database has a column for it (migration 011); otherwise only marks the order paid.
function is_missing_column(error) {
  return error?.code === 'PGRST204' || error?.code === '42703' || String(error?.message || '').includes('payment_reference');
}

async function mark_paid(order, reference) {
  try {
    return await update_order(order.id, order.tenant_id, { payment_status: 'paid', payment_reference: reference });
  } catch (err) {
    if (!is_missing_column(err)) throw err;
    console.warn(`payment_reference column is missing (run migration 011); order ${order.id} marked paid without it. Payment reference: ${reference}`);
    return update_order(order.id, order.tenant_id, { payment_status: 'paid' });
  }
}

export async function confirm_online_payment(customer_id, order_id, input) {
  const order = await find_payable_order(customer_id, order_id);
  const { reference } = await payment_provider.verify(order, input);
  const paid = await mark_paid(order, reference);
  return { payment_status: paid.payment_status, order_id: paid.id };
}
