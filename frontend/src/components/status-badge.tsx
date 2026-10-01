// Colored status pill that turns raw values like "ready_for_pickup" into readable labels.
import { cn } from '@/lib/utils';
import { STATUS_TONE_CLASSNAME, type StatusTone } from '@/lib/status-colors';

function format_status_label(value: string): string {
  const text = value.replaceAll('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function StatusBadge({ tone, value, className }: { tone: StatusTone; value: string; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap', STATUS_TONE_CLASSNAME[tone], className)}>
      {format_status_label(value)}
    </span>
  );
}
