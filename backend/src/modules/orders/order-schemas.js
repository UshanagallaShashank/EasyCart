// Zod schemas for validating checkout and order-status input.
import { z } from 'zod';

const cart_item_schema = z.object({
  product_id: z.string(),
  variant_label: z.string().optional(),
  quantity: z.number().int().positive()
});

export const checkout_schema = z.object({
  items: z.array(cart_item_schema).min(1),
  payment_method: z.enum(['cash_on_delivery'])
});

export const order_status_schema = z.object({
  status: z.enum(['pending', 'confirmed', 'fulfilled', 'cancelled'])
});

export function validate_checkout_input(data) {
  return checkout_schema.safeParse(data);
}

export function validate_order_status_input(data) {
  return order_status_schema.safeParse(data);
}
