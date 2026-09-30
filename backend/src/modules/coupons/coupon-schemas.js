// Zod schemas for validating coupon input.
import { z } from 'zod';

export const coupon_schema = z
  .object({
    code: z.string().trim().min(2).max(20).toUpperCase(),
    discount_type: z.enum(['flat', 'percent']),
    discount_value: z.number().positive(),
    expires_at: z.union([z.string().datetime(), z.string(), z.literal(''), z.null()]).optional().nullable()
  })
  .refine((data) => data.discount_type !== 'percent' || data.discount_value <= 100, {
    message: 'A percent discount cannot exceed 100',
    path: ['discount_value']
  });

export const coupon_update_schema = z.object({
  is_active: z.boolean().optional(),
  expires_at: z.union([z.string().datetime(), z.string(), z.literal(''), z.null()]).optional().nullable()
});

export function validate_coupon_input(data) {
  return coupon_schema.safeParse(data);
}

export function validate_coupon_update_input(data) {
  return coupon_update_schema.safeParse(data);
}
