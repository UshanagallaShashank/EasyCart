// Pill buttons for choosing a product variant; sold-out variants are disabled.
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/features/products/types/product-types';

interface VariantPickerProps {
  variants: ProductVariant[];
  value?: string;
  onChange(label: string): void;
}

export function VariantPicker({ variants, value, onChange }: VariantPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-slate-900">Options</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.label}
            type="button"
            aria-pressed={value === v.label}
            disabled={v.stock <= 0}
            onClick={() => onChange(v.label)}
            className={cn(
              'min-h-10 rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-40',
              value === v.label ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
