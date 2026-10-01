// Items in an order: a stacked list on phones, a table with line totals on larger screens.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '../lib/order-rules';
import type { OrderItem } from '../types/order-types';

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <>
      <ul className="divide-y divide-slate-100 sm:hidden">
        {items.map((item, i) => (
          <li key={i} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0"><p className="font-medium text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.variant_label ? `${item.variant_label} · ` : ''}{item.quantity} × {formatMoney(item.price)}</p></div>
            <p className="shrink-0 font-semibold tabular-nums">{formatMoney(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>
      <div className="hidden sm:block">
        <Table>
          <TableHeader><TableRow className="hover:bg-transparent"><TableHead>Product</TableHead><TableHead>Variant</TableHead><TableHead>Price</TableHead><TableHead>Qty</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-slate-500">{item.variant_label ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{formatMoney(item.price)}</TableCell>
                <TableCell className="tabular-nums">{item.quantity}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatMoney(item.price * item.quantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
