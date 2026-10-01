// Sales insights: money only — headline numbers, 30-day trend, top stores, weekday pattern, week comparison, daily table.
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformStats } from '../hooks/use-platform-stats';
import { get_week_trend } from '../lib/get-week-trend';
import { AdminPageTitle } from '../components/page-title';
import { SalesKpis } from '../components/sales-kpis';
import { WeekComparisonCard } from '../components/week-comparison-card';
import { PlatformRevenueChart } from '../components/platform-revenue-chart';
import { TopStoresCard } from '../components/top-stores-card';
import { WeekdaySalesChart } from '../components/weekday-sales-chart';
import { DailySalesTable } from '../components/daily-sales-table';

export function SalesInsightsPage() {
  const { data: stats, isLoading } = usePlatformStats();
  const trend = stats ? get_week_trend(stats.daily_revenue) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageTitle title="Sales" description="Money across every store. Cancelled orders are not counted as sales." />
      {isLoading || !stats || !trend ? <Skeleton className="h-96 w-full rounded-2xl" /> : (
        <>
          <SalesKpis totals={stats.totals} series={stats.daily_revenue} />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2"><PlatformRevenueChart series={stats.daily_revenue} /></div>
            <TopStoresCard stores={stats.top_stores} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <WeekdaySalesChart series={stats.daily_revenue} />
            <WeekComparisonCard sales={trend.sales} orders={trend.orders} />
          </div>
          <DailySalesTable series={stats.daily_revenue} />
        </>
      )}
    </div>
  );
}
