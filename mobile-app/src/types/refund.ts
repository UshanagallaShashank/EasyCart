// Refunds, as the server sends them.
export type RefundStatus = 'requested' | 'refunded' | 'rejected' | 'failed';
export type RefundReason = 'damaged' | 'missing' | 'wrong_item' | 'quality' | 'cancelled' | 'other';

export interface Refund {
  id: string;
  order_id: string;
  tenant_id: string;
  customer_id: string;
  amount: number;
  reason: RefundReason;
  details: string | null;
  photo_urls: string[];
  status: RefundStatus;
  method: 'online' | 'cash' | null;
  provider_refund_id: string | null;
  decision_note: string | null;
  created_at: string;
  decided_at: string | null;
}

export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  damaged: 'Damaged',
  missing: 'Missing items',
  wrong_item: 'Wrong item',
  quality: 'Poor quality',
  cancelled: 'Order cancelled',
  other: 'Other'
};

export const REFUND_STATUS: Record<RefundStatus, { label: string; tone: 'warning' | 'success' | 'danger' }> = {
  requested: { label: 'Waiting for the store', tone: 'warning' },
  refunded: { label: 'Refunded', tone: 'success' },
  rejected: { label: 'Not refunded', tone: 'danger' },
  failed: { label: 'Refund failed', tone: 'danger' }
};
