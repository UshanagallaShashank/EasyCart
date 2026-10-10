// A new order offered to this rider: what they earn, where the store is, and a countdown before it moves on.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Clock, Package, Store, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format_price } from '@/lib/format-price';
import { ApiError } from '@/shared/api/api-error';
import { acceptOffer, declineOffer } from '@/features/delivery/api/rider-api';
import { formatDistance } from '@/features/delivery/lib/delivery-labels';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';
import { useRiderOrderMutation } from '../hooks/use-rider-queries';

function useSecondsLeft(until: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return until ? Math.max(0, Math.round((new Date(until).getTime() - now) / 1000)) : 0;
}

export function OfferCard({ order, onAccepted }: { order: RiderOrder; onAccepted(id: string): void }) {
  const secondsLeft = useSecondsLeft(order.offer_expires_at);
  const accept = useRiderOrderMutation(acceptOffer);
  const decline = useRiderOrderMutation(declineOffer);
  const busy = accept.isPending || decline.isPending;
  const fail = (fallback: string) => (err: unknown) => toast.error(err instanceof ApiError ? err.message : fallback);

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-sky-400 bg-white shadow-md shadow-sky-500/10">
      <div className="flex items-center justify-between gap-2 bg-sky-50 px-4 py-2.5">
        <span className="text-xs font-bold tracking-wider text-sky-700 uppercase">New order</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-sky-700 tabular-nums"><Clock className="size-3.5" /> {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}</span>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{format_price(order.earning)}</p>
          <p className="text-xs text-slate-500">you earn</p>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-slate-700">
          <li className="flex items-start gap-2"><Store className="mt-0.5 size-4 shrink-0 text-sky-500" /><span className="min-w-0"><strong className="font-semibold">{order.store.name}</strong> · {formatDistance(order.store.distance_km)} away{order.store.address && <span className="block truncate text-xs text-slate-500">{order.store.address}</span>}</span></li>
          <li className="flex items-center gap-2"><Package className="size-4 shrink-0 text-sky-500" />{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</li>
          <li className="flex items-center gap-2"><Wallet className="size-4 shrink-0 text-sky-500" />{order.cash_to_collect > 0 ? <>Collect <strong className="font-semibold">{format_price(order.cash_to_collect)}</strong> cash</> : 'Already paid, no cash'}</li>
        </ul>
        <p className="text-[11px] text-slate-400">The drop address shows once you accept.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" disabled={busy} onClick={() => decline.mutate(order.id, { onError: fail('Could not decline') })}>Decline</Button>
          <Button size="lg" disabled={busy || secondsLeft === 0} onClick={() => accept.mutate(order.id, { onSuccess: () => onAccepted(order.id), onError: fail('Could not accept') })}>{accept.isPending ? 'Accepting…' : 'Accept'}</Button>
        </div>
      </div>
    </article>
  );
}
