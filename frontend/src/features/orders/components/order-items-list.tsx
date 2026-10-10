// Items in an order as a stacked list (name, variant, quantity × price, line total) that fits any width.
import { formatMoney } from '../lib/order-rules';
import type { OrderItem } from '../types/order-types';

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
      <ul className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0"><p className="font-medium break-words text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.variant_label ? `${item.variant_label} · ` : ''}{item.quantity} × {formatMoney(item.price)}</p></div>
            <p className="shrink-0 font-semibold tabular-nums">{formatMoney(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
  );
}
