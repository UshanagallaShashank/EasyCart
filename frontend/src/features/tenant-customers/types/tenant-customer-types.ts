// Types mirroring the backend tenant-customer wire format exactly.
import type { Order } from '@/features/orders/types/order-types';

export interface TenantCustomerSummary {
  customer_id: string;
  username: string | null;
  email: string | null;
  order_count: number;
  lifetime_total: number;
  last_order_at: string;
}

export interface TenantCustomerDetail {
  customer_id: string;
  username: string | null;
  email: string | null;
  orders: Order[];
}
