// Marks payment status for a newly created order based on its payment method.
import { AppError } from '../../../platform/shared/app-error.js';

export async function process_payment(order, method) {
  // Both ways start unpaid. Cash is collected at the door; an online payment is started and confirmed right after the order is placed.
  if (method === 'cash_on_delivery' || method === 'online') {
    return { ...order, payment_status: 'unpaid' };
  }
  throw new AppError('Unsupported payment method', 400);
}
