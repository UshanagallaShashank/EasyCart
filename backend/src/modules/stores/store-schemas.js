// Zod schema for validating store settings updates.
import { z } from 'zod';

export const store_settings_schema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    logo_url: z.string().url().optional(),
    banner_url: z.string().url().optional(),
    theme: z.enum(['default', 'light', 'dark']).optional()
  })
  .partial();

export function validate_store_settings_input(data) {
  return store_settings_schema.safeParse(data);
}
