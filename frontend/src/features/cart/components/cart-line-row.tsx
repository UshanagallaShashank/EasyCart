import { Package, Trash2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../cart-context';
import type { CartLine } from '../types/cart-types';

export function CartLineRow({ line }: { line: CartLine }) {
  const { removeItem, updateQuantity } = useCart();

  const isMaxStockReached = line.max_stock !== undefined && line.quantity >= line.max_stock;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-slate-200">
      {line.image ? (
        <img src={line.image} alt={line.name} className="size-14 sm:size-16 rounded-2xl border border-slate-100 bg-slate-50 object-cover" />
      ) : (
        <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-300">
          <Package className="size-6 text-slate-300" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base font-bold text-[#0F172A] truncate">{line.name}</h3>
        <p className="text-xs text-slate-400 font-medium">
          Rs. {line.price.toFixed(2)} each {line.variant_label ? `· ${line.variant_label}` : ''}
        </p>

        {/* Quantity Controls Pill */}
        <div className="mt-2.5 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => updateQuantity(line.product_id, Math.max(1, line.quantity - 1), line.variant_label)}
            className="flex size-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Minus className="size-3" />
          </button>
          <span className="w-8 text-center font-bold text-slate-900 text-xs">{line.quantity}</span>
          <button
            type="button"
            onClick={() => {
              if (isMaxStockReached) {
                toast.error(`Stock is only ${line.max_stock} left for this item`);
                return;
              }
              updateQuantity(line.product_id, line.quantity + 1, line.variant_label);
            }}
            disabled={isMaxStockReached}
            className="flex size-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto sm:ml-0">
        <p className="font-heading text-base font-extrabold text-[#0F172A] tabular-nums">
          Rs. {(line.price * line.quantity).toFixed(2)}
        </p>
        <button
          type="button"
          onClick={() => removeItem(line.product_id, line.variant_label)}
          className="text-slate-300 hover:text-rose-500 transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-rose-50"
          title="Remove item"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
