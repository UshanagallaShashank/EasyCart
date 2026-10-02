// Zod schemas for validating checkout and order-status input.
import { z } from 'zod';

const cart_item_schema = z.object({
  product_id: z.string(),
  variant_label: z.string().optional(),
  quantity: z.number().int().positive().max(99, 'You can order up to 99 of one item')
});

export const checkout_schema = z
  .object({
    items: z.array(cart_item_schema).min(1, 'Your cart is empty').max(50, 'A single order can have up to 50 different items'),
    payment_method: z.enum(['cash_on_delivery']),
    fulfillment_method: z.enum(['pickup', 'delivery']).default('pickup'),
    delivery_address: z.string().trim().min(5, 'Please enter the full delivery address').max(300, 'Delivery address is too long').optional(),
    coupon_code: z.string().trim().min(1).optional()
  })
  .refine((data) => data.fulfillment_method !== 'delivery' || !!data.delivery_address, {
    message: 'Delivery address is required for delivery orders',
    path: ['delivery_address']
  });

export const order_status_schema = z.object({
  status: z.enum(['pending', 'confirmed', 'fulfilled', 'cancelled'])
});

const PICKUP_FULFILLMENT_STATUSES = ['not_started', 'ready_for_pickup', 'picked_up'];
const DELIVERY_FULFILLMENT_STATUSES = ['not_started', 'dispatched', 'delivered'];

export const fulfillment_status_schema = z.object({
  fulfillment_status: z.enum([...new Set([...PICKUP_FULFILLMENT_STATUSES, ...DELIVERY_FULFILLMENT_STATUSES])])
});

export const assignment_schema = z.object({
  assigned_to: z.string().trim().min(1).nullable()
});

export function validate_checkout_input(data) {
  return checkout_schema.safeParse(data);
}

export function validate_order_status_input(data) {
  return order_status_schema.safeParse(data);
}

export function validate_fulfillment_status_input(data) {
  return fulfillment_status_schema.safeParse(data);
}

export function validate_assignment_input(data) {
  return assignment_schema.safeParse(data);
}

export function is_valid_fulfillment_status_for_method(fulfillment_method, fulfillment_status) {
  const allowed = fulfillment_method === 'delivery' ? DELIVERY_FULFILLMENT_STATUSES : PICKUP_FULFILLMENT_STATUSES;
  return allowed.includes(fulfillment_status);
}
