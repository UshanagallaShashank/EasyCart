// Zod schema for a customer's rating of an order.
import { z } from 'zod';

const stars = z.number().int().min(1).max(5);

export const rating_schema = z.object({
  store_stars: stars,
  delivery_stars: stars.optional().nullable(),
  comment: z.string().trim().max(300).optional().nullable(),
  // Up to 3 photos the customer uploaded for this rating.
  photo_urls: z.array(z.string().max(500)).max(3).optional(),
  // Stars for products in the order: { "product id": 1-5 }.
  item_stars: z.record(z.string(), stars).optional()
});

export function validate_rating_input(data) {
  return rating_schema.safeParse(data);
}
