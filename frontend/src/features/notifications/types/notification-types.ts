// Types mirroring the backend notification wire format exactly.
export interface Notification {
  id: string;
  tenant_id: string;
  type: 'order_placed' | 'cart_abandoned';
  message: string;
  is_read: boolean;
  created_at: string;
}
