// Zod schemas for validating product input.
import { z } from 'zod';

const variant_schema = z.object({ label: z.string(), sku: z.string(), price: z.number().positive(), stock: z.number().int().nonnegative() });

export const product_schema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  sku: z.string().min(1),
  category_id: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.array(variant_schema).optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  low_stock_threshold: z.number().int().nonnegative().optional()
});

export function validate_product_input(data) {
  return product_schema.safeParse(data);
}

export function validate_product_update_input(data) {
  return product_schema.partial().safeParse(data);
}
