// Zod schemas for refund requests and the store's decision.
import { z } from 'zod';
import { REFUND_REASONS } from './refund-rules.js';

export const refund_request_schema = z.object({
  amount: z.number().positive().max(1_000_000),
  reason: z.enum(REFUND_REASONS),
  details: z.string().trim().max(300).optional().nullable(),
  photo_urls: z.array(z.string().max(500)).max(3).optional()
});

export const refund_decision_schema = z.object({
  approve: z.boolean(),
  note: z.string().trim().max(300).optional().nullable(),
  // For an online payment the store already refunded from the payment company's own dashboard.
  manual: z.boolean().optional()
});
