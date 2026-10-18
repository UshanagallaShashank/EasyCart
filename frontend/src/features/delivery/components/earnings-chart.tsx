// Rider earnings per day for the last two weeks, using the shared single-series bar chart.
import { DailyBarChart } from '@/components/daily-bar-chart';
import { format_price } from '@/lib/format-price';
import type { DayBucket } from '@/lib/bucket-by-day';
import type { DailyPoint } from '../types/delivery-types';

function toBuckets(daily: DailyPoint[]): DayBucket[] {
  return daily.map((point) => {
    const date = new Date(`${point.date}T00:00:00`);
    return {
      key: point.date,
      label: String(date.getDate()),
      fullLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
      value: point.earnings,
      count: point.deliveries
    };
  });
}

export function EarningsChart({ daily, title = 'Earnings, last 14 days' }: { daily: DailyPoint[]; title?: string }) {
  const total = daily.reduce((sum, point) => sum + point.earnings, 0);
  return (
    <DailyBarChart
      title={title}
      headline={format_price(total)}
      days={toBuckets(daily)}
      describe={(day) => ({ value: format_price(day.value), detail: `${day.fullLabel} · ${day.count} ${day.count === 1 ? 'delivery' : 'deliveries'}` })}
    />
  );
}
