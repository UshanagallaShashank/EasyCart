// Converts the server's UTC daily sales series into chart buckets, labelling every fifth day on long ranges.
import type { DayBucket } from '@/lib/bucket-by-day';
import type { PlatformStats } from '../types/admin-types';

function label_day(date: Date, index: number, total: number): string {
  if (total <= 14 || index % 5 === 0 || index === total - 1) return String(date.getUTCDate());
  return '';
}

export function to_day_buckets(series: PlatformStats['daily_revenue']): DayBucket[] {
  return series.map((d, i) => {
    const date = new Date(`${d.date}T00:00:00Z`);
    const fullLabel = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    return { key: d.date, label: label_day(date, i, series.length), fullLabel, value: d.revenue, count: d.orders };
  });
}
