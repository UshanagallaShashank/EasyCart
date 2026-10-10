// Compares the last 7 days with the 7 days before, for sales and order counts from the daily series.
import type { PlatformStats } from '../types/admin-types';

export interface Trend {
  current: number;
  previous: number;
  change: number | null;
}

function make_trend(current: number, previous: number): Trend {
  return { current, previous, change: previous > 0 ? ((current - previous) / previous) * 100 : null };
}

export function get_week_trend(series: PlatformStats['daily_revenue']): { sales: Trend; orders: Trend } {
  const last = series.slice(-7);
  const prior = series.slice(-14, -7);
  const sum = (days: typeof series, key: 'revenue' | 'orders') => days.reduce((total, d) => total + d[key], 0);
  return { sales: make_trend(sum(last, 'revenue'), sum(prior, 'revenue')), orders: make_trend(sum(last, 'orders'), sum(prior, 'orders')) };
}
