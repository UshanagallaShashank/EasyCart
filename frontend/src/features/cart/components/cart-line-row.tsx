// One cart line: thumbnail, name/variant, quantity stepper, line total, and remove action.
import { Package, Trash2 } from 'lucide-react';
import { QuantityStepper } from '@/components/quantity-stepper';
import { format_price } from '@/lib/format-price';
import { useCart } from '../cart-context';
import type { CartLine } from '../types/cart-types';

export function CartLineRow({ line }: { line: CartLine }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 sm:gap-4 sm:p-4">
      {line.image ? (
        <img src={line.image} alt={line.name} className="size-20 shrink-0 rounded-xl object-cover sm:size-24" />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:size-24"><Package className="size-6 text-slate-400" /></div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold text-slate-900">{line.name}</p>
            {line.variant_label && <p className="text-sm text-slate-500">{line.variant_label}</p>}
            <p className="text-sm text-slate-500 tabular-nums">{format_price(line.price)} each</p>
          </div>
          <button type="button" aria-label={`Remove ${line.name}`} onClick={() => removeItem(line.product_id, line.variant_label)} className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <QuantityStepper size="sm" value={line.quantity} onChange={(q) => updateQuantity(line.product_id, q, line.variant_label)} />
          <p className="font-semibold text-slate-900 tabular-nums">{format_price(line.price * line.quantity)}</p>
        </div>
      </div>
    </div>
  );
}
