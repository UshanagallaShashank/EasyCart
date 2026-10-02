// An order the rider is carrying, with the next step and a link to the full delivery screen.
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Store } from 'lucide-react';
import { format_price } from '@/lib/format-price';
import { ToneBadge } from '@/features/delivery/components/tone-badge';
import { RIDER_ORDER_STAGE } from '@/features/delivery/lib/delivery-labels';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';

export function ActiveDeliveryCard({ order }: { order: RiderOrder }) {
  const stage = RIDER_ORDER_STAGE[order.stage];
  const toStore = order.stage === 'to_pickup';
  return (
    <Link to={`/rider/orders/${order.id}`} className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition-colors hover:border-sky-300">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">{toStore ? <Store className="size-5" /> : <MapPin className="size-5" />}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><ToneBadge tone={stage.tone} label={stage.label} /><span className="font-mono text-[11px] text-slate-400">#{order.id.slice(0, 8)}</span></div>
        <p className="mt-1 truncate text-sm font-semibold text-slate-900">{toStore ? order.store.name : order.delivery_address}</p>
        <p className="text-xs text-slate-500">{order.cash_to_collect > 0 ? `Collect ${format_price(order.cash_to_collect)}` : 'Prepaid'} · Earn {format_price(order.earning)}</p>
      </div>
      <ChevronRight className="size-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
