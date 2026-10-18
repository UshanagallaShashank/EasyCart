// Average daily sales for each weekday (UTC, Monday first) across the daily series, as chart buckets.
import type { DayBucket } from '@/lib/bucket-by-day';
import type { PlatformStats } from '../types/admin-types';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function get_weekday_averages(series: PlatformStats['daily_revenue']): DayBucket[] {
  const sums = WEEKDAYS.map(() => ({ revenue: 0, orders: 0, days: 0 }));
  for (const day of series) {
    const index = (new Date(`${day.date}T00:00:00Z`).getUTCDay() + 6) % 7;
    sums[index].revenue += day.revenue;
    sums[index].orders += day.orders;
    sums[index].days += 1;
  }
  return sums.map((s, i) => ({ key: WEEKDAYS[i], label: WEEKDAYS[i], fullLabel: `${FULL_WEEKDAYS[i]}s (${s.days} days)`, value: s.days ? s.revenue / s.days : 0, count: s.days ? Math.round((s.orders / s.days) * 10) / 10 : 0 }));
}
