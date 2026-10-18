// Seven-day revenue chart for the store overview; cancelled orders are not counted.
import { Skeleton } from '@/components/ui/skeleton';
import { DailyBarChart } from '@/components/daily-bar-chart';
import { bucket_by_day, type DayBucket } from '@/lib/bucket-by-day';
import { format_price } from '@/lib/format-price';
import type { Order } from '@/features/orders/types/order-types';

function describe_sales_day(day: DayBucket) {
  return { value: format_price(day.value), detail: `${day.count} ${day.count === 1 ? 'order' : 'orders'}` };
}

export function SalesChart({ orders }: { orders: Order[] | undefined }) {
  if (!orders) return <Skeleton className="h-[300px] w-full rounded-2xl" />;
  const counted = orders.filter((o) => o.status !== 'cancelled');
  const days = bucket_by_day(counted, 7, (o) => o.created_at, (o) => o.total);
  const total = days.reduce((sum, d) => sum + d.value, 0);

  return <DailyBarChart title="Sales, last 7 days" headline={format_price(total)} days={days} describe={describe_sales_day} />;
}
