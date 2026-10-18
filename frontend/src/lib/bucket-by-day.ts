// Groups items into one bucket per calendar day for the last N days (oldest first), summing a value per day.
export interface DayBucket {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
  count: number;
}

function to_day_key(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function make_bucket(daysAgo: number, total: number): DayBucket {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const label = total <= 7 ? date.toLocaleDateString(undefined, { weekday: 'short' }) : String(date.getDate());
  return { key: to_day_key(date), label, fullLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }), value: 0, count: 0 };
}

export function bucket_by_day<T>(items: T[], days: number, get_date: (item: T) => string, get_value: (item: T) => number): DayBucket[] {
  const buckets = Array.from({ length: days }, (_, i) => make_bucket(days - 1 - i, days));
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const item of items) {
    const bucket = byKey.get(to_day_key(new Date(get_date(item))));
    if (!bucket) continue;
    bucket.value += get_value(item);
    bucket.count += 1;
  }
  return buckets;
}
