// Zod schema for a customer's rating of an order.
import { z } from 'zod';

const stars = z.number().int().min(1).max(5);

export const rating_schema = z.object({
  store_stars: stars,
  delivery_stars: stars.optional().nullable(),
  comment: z.string().trim().max(300).optional().nullable()
});

export function validate_rating_input(data) {
  return rating_schema.safeParse(data);
}
