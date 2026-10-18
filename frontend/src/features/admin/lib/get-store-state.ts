// One customer-facing state per store: Suspended (admin) wins, then Live or Not published (owner's switch).
import type { StatusTone } from '@/lib/status-colors';
import type { AdminTenant } from '../types/admin-types';

export function get_store_state(tenant: Pick<AdminTenant, 'status' | 'is_published'>): { label: string; tone: StatusTone; hint: string } {
  if (tenant.status === 'suspended') return { label: 'suspended', tone: 'danger', hint: 'Taken offline by an admin' };
  if (tenant.is_published) return { label: 'live', tone: 'success', hint: 'Customers can see and order' };
  return { label: 'not published', tone: 'warning', hint: 'Owner has not switched the shop on yet' };
}
