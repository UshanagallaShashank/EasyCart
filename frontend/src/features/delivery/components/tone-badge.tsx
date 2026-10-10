// Small colored pill with a ready-made label (StatusBadge formats raw values; this one shows text as given).
import { cn } from '@/lib/utils';
import { STATUS_TONE_CLASSNAME, type StatusTone } from '@/lib/status-colors';

export function ToneBadge({ tone, label, className }: { tone: StatusTone; label: string; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap', STATUS_TONE_CLASSNAME[tone], className)}>{label}</span>;
}
