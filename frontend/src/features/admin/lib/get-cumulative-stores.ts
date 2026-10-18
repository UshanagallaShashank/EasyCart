// Running total of stores at the end of each of the last N days (local time), oldest first.
export interface CumulativePoint {
  key: string;
  label: string;
  total: number;
  added: number;
}

export function get_cumulative_stores(createdAt: string[], days: number): CumulativePoint[] {
  const times = createdAt.map((iso) => new Date(iso).getTime());
  return Array.from({ length: days }, (_, i) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - (days - 1 - i));
    const start = end.getTime() - 24 * 60 * 60 * 1000;
    const label = end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    return { key: label, label, total: times.filter((t) => t <= end.getTime()).length, added: times.filter((t) => t > start && t <= end.getTime()).length };
  });
}
