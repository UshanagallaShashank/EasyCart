// Zod schema for validating store settings updates.
import { z } from 'zod';

export const store_settings_schema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    logo_url: z.union([z.string().url(), z.literal('')]).optional(),
    banner_url: z.union([z.string().url(), z.literal('')]).optional(),
    theme: z.enum(['default', 'light', 'dark']).optional(),
    delivery_fee: z.number().min(0).optional(),
    promotion_banner_text: z.string().trim().max(200).optional()
  })
  .partial();

export function validate_store_settings_input(data) {
  return store_settings_schema.safeParse(data);
}
