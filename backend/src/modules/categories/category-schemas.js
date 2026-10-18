// Zod schema for validating category input.
import { z } from 'zod';

export const category_schema = z.object({ name: z.string().trim().min(1).max(60) });

export function validate_category_input(data) {
  return category_schema.safeParse(data);
}
