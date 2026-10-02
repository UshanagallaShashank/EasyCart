// Zod schema for validating store settings updates.
import { z } from 'zod';

export const store_settings_schema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    logo_url: z.union([z.string(), z.null()]).optional(),
    banner_url: z.union([z.string(), z.null()]).optional(),
    theme: z.enum(['default', 'light', 'dark']).optional(),
    delivery_fee: z.number().min(0).optional(),
    max_delivery_radius_km: z.number().min(0).optional(),
    pincode: z.union([z.string(), z.null()]).optional(),
    address: z.union([z.string(), z.null()]).optional(),
    latitude: z.union([z.number(), z.null()]).optional(),
    longitude: z.union([z.number(), z.null()]).optional(),
    promotion_banner_text: z.union([z.string(), z.null()]).optional()
  })
  .partial();

export function validate_store_settings_input(data) {
  return store_settings_schema.safeParse(data);
}
