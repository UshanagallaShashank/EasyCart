// Average sales per weekday over the last 30 days, naming the strongest day in the headline.
import { DailyBarChart } from '@/components/daily-bar-chart';
import type { DayBucket } from '@/lib/bucket-by-day';
import { formatMoney } from '@/features/orders/lib/order-rules';
import { get_weekday_averages } from '../lib/get-weekday-averages';
import type { PlatformStats } from '../types/admin-types';

function describe_weekday(day: DayBucket) {
  return { value: `${formatMoney(day.value)} avg`, detail: `${day.count} orders/day` };
}

export function WeekdaySalesChart({ series }: { series: PlatformStats['daily_revenue'] }) {
  const days = get_weekday_averages(series);
  const best = days.reduce((top, d) => (d.value > top.value ? d : top), days[0]);
  const headline = best.value > 0 ? `${best.fullLabel.split(' ')[0]} sell best` : 'No sales yet';

  return <DailyBarChart title="Average sales by weekday (last 30 days, UTC)" headline={headline} days={days} describe={describe_weekday} highlightLast={false} />;
}
