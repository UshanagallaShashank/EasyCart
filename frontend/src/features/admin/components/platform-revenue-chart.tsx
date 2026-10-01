// Sales across all stores per day for the last 30 days (UTC days).
import { DailyBarChart } from '@/components/daily-bar-chart';
import type { DayBucket } from '@/lib/bucket-by-day';
import { formatMoney } from '@/features/orders/lib/order-rules';
import { to_day_buckets } from '../lib/to-day-buckets';
import type { PlatformStats } from '../types/admin-types';

function describe_revenue_day(day: DayBucket) {
  return { value: formatMoney(day.value), detail: `${day.count} ${day.count === 1 ? 'order' : 'orders'}` };
}

export function PlatformRevenueChart({ series }: { series: PlatformStats['daily_revenue'] }) {
  const days = to_day_buckets(series);
  const total = days.reduce((sum, d) => sum + d.value, 0);
  return <DailyBarChart title="Sales across all stores, last 30 days" headline={formatMoney(total)} days={days} describe={describe_revenue_day} />;
}
