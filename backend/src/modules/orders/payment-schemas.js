// Zod schema for validating payment-status updates.
import { z } from 'zod';

export const payment_status_schema = z.object({
  payment_status: z.enum(['unpaid', 'paid'])
});

export function validate_payment_status_input(data) {
  return payment_status_schema.safeParse(data);
}
