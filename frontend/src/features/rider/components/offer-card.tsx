// An open order this rider can take: what they earn and where the store is. The first nearby rider to accept gets it.
import { toast } from 'sonner';
import { Package, Store, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format_price } from '@/lib/format-price';
import { ApiError } from '@/shared/api/api-error';
import { acceptOffer, declineOffer } from '@/features/delivery/api/rider-api';
import { formatDistance } from '@/features/delivery/lib/delivery-labels';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';
import { useRiderOrderMutation } from '../hooks/use-rider-queries';

export function OfferCard({ order, onAccepted }: { order: RiderOrder; onAccepted(id: string): void }) {
  const accept = useRiderOrderMutation(acceptOffer);
  const decline = useRiderOrderMutation(declineOffer);
  const busy = accept.isPending || decline.isPending;
  const fail = (fallback: string) => (err: unknown) => toast.error(err instanceof ApiError ? err.message : fallback);

  return (
    <article className="overflow-hidden rounded-2xl border-2 border-sky-400 bg-white shadow-md shadow-sky-500/10">
      <div className="flex items-center justify-between gap-2 bg-sky-50 px-4 py-2.5">
        <span className="text-xs font-bold tracking-wider text-sky-700 uppercase">Order #{order.id.slice(0, 8)}</span>
        <span className="text-xs font-semibold text-sky-700">First to accept gets it</span>
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
        <p className="text-[11px] text-slate-400">Packed {new Date(order.ready_at ?? order.created_at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · The drop address shows once you accept.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="lg" disabled={busy} onClick={() => decline.mutate(order.id, { onError: fail('Could not decline') })}>Decline</Button>
          <Button size="lg" disabled={busy} onClick={() => accept.mutate(order.id, { onSuccess: () => onAccepted(order.id), onError: fail('Could not accept') })}>{accept.isPending ? 'Accepting…' : 'Accept'}</Button>
        </div>
      </div>
    </article>
  );
}
