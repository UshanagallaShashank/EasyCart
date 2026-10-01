// New stores created per day over the last 14 days.
import { DailyBarChart } from '@/components/daily-bar-chart';
import { bucket_by_day, type DayBucket } from '@/lib/bucket-by-day';
import type { AdminTenant } from '../types/admin-types';

function describe_signup_day(day: DayBucket) {
  return { value: `${day.value} ${day.value === 1 ? 'store' : 'stores'}`, detail: 'created' };
}

export function TenantSignupsChart({ tenants }: { tenants: AdminTenant[] }) {
  const days = bucket_by_day(tenants, 14, (t) => t.created_at, () => 1);
  const total = days.reduce((sum, d) => sum + d.value, 0);

  return <DailyBarChart title="New stores, last 14 days" headline={`${total} ${total === 1 ? 'store' : 'stores'}`} days={days} describe={describe_signup_day} />;
}
