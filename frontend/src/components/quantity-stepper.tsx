// Minus/plus control for picking an item quantity within optional bounds.
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange(next: number): void;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantityStepper({ value, onChange, max, size = 'md' }: QuantityStepperProps) {
  const button = cn('flex items-center justify-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40', size === 'sm' ? 'size-8' : 'size-11');
  const atMax = max !== undefined && value >= max;

  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
      <button type="button" aria-label="Decrease quantity" className={button} disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <span className={cn('text-center font-semibold tabular-nums text-slate-900', size === 'sm' ? 'w-7 text-sm' : 'w-9')} aria-live="polite">{value}</span>
      <button type="button" aria-label="Increase quantity" className={button} disabled={atMax} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
