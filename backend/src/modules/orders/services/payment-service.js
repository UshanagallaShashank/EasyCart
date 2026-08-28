// Marks payment status for a newly created order based on its payment method.
import { AppError } from '../../../platform/shared/app-error.js';

export async function process_payment(order, method) {
  if (method === 'cash_on_delivery') {
    return { ...order, payment_status: 'unpaid' };
  }
  throw new AppError('Unsupported payment method', 400);
}
