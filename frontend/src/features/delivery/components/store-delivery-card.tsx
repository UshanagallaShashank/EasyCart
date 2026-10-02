// The store's delivery panel on an order: one tap to send it for delivery, then who is coming, the pickup code and the proof.
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, Bike, KeyRound, Loader2, MapPinOff, RotateCcw, Search, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/shared/api/api-error';
import type { Order } from '@/features/orders/types/order-types';
import { useStoreDeliveryAction, useStoreOrderDelivery, useSettleOrderDelivery } from '../hooks/use-store-delivery';
import type { StoreAction } from '../api/handover-api';
import { DeliveryJourney } from './delivery-journey';
import { HandoverRiderCard } from './handover-rider-card';
import { DeliveryTimeline } from './delivery-timeline';
import { ProofPhoto } from './proof-photo';
import { OrderSettlementCard } from './order-settlement-card';

const DONE_MESSAGE: Record<StoreAction, string> = {
  'request-rider': 'Sent for delivery. Looking for the nearest rider.',
  'cancel-rider': 'Rider request cancelled',
  'new-pickup-code': 'New pickup code made',
  'new-delivery-code': 'The customer now sees a new delivery code'
};

export function StoreDeliveryCard({ order }: { order: Order }) {
  const { data: delivery, isLoading } = useStoreOrderDelivery(order.id, true);
  const action = useStoreDeliveryAction(order.id);
  const settleMutation = useSettleOrderDelivery(order.id);
  const run = (name: StoreAction) => action.mutate(name, {
    onSuccess: () => toast.success(DONE_MESSAGE[name]),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
  });

  if (isLoading || !delivery) return <Skeleton className="h-48 w-full rounded-2xl" />;

  const searching = delivery.stage === 'ready_for_delivery' || (delivery.stage === 'rider_assigned' && delivery.rider_offer_status === 'offered');
  const waitingPickup = delivery.stage === 'rider_assigned' && delivery.rider_offer_status === 'accepted';
  const canSend = delivery.stage === 'not_started' && order.status !== 'cancelled';
  const open = !['delivered', 'cancelled'].includes(delivery.stage);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><Bike className="size-4 text-sky-500" /> Delivery</h2>

      <div className="flex flex-col gap-4">
        <DeliveryJourney stage={delivery.stage} offerStatus={delivery.rider_offer_status} role="store" riderName={delivery.rider?.full_name ?? null} arrival={delivery.pickup_eta ?? delivery.dropoff_eta} />

        {!delivery.store_has_location && open && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800"><MapPinOff className="mt-0.5 size-4 shrink-0" /><span>Your store has no pickup location, so any online rider may get this order. <Link to="/dashboard/delivery" className="font-semibold underline">Set location</Link></span></p>
        )}

        {canSend && (
          <Button size="lg" onClick={() => run('request-rider')} disabled={action.isPending}><Search /> {action.isPending ? 'Sending…' : 'Packed, send for delivery'}</Button>
        )}

        {searching && (
          <p className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="size-4 shrink-0 animate-spin text-sky-500" /> Searching. This page updates by itself, there is nothing to press.</p>
        )}

        {delivery.stage === 'ready_for_delivery' && (delivery.declined_count ?? 0) > 0 && (
          <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            {delivery.declined_count} {delivery.declined_count === 1 ? 'rider' : 'riders'} nearby passed on this order. Tap <strong>Search again</strong> to offer it to everyone again, or deliver it yourself.
          </p>
        )}

        {delivery.rider && <HandoverRiderCard rider={delivery.rider} caption={delivery.stage === 'delivered' ? 'Delivered by' : 'Your rider'} />}

        {delivery.pickup_code && (
          <div className="rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/60 p-4 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-sky-700 uppercase"><KeyRound className="size-3.5" /> Pickup code</p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-[0.3em] text-slate-900">{delivery.pickup_code}</p>
            <p className="mt-1 text-[11px] text-slate-500">{waitingPickup ? 'Give this to the rider only after you have checked their photo and number plate.' : 'It is ready for when the rider arrives.'}</p>
          </div>
        )}

        {delivery.pickup_locked && <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700"><AlertTriangle className="size-4 shrink-0" /> Too many wrong pickup codes. Make a new one if this is really your rider.</p>}
        {delivery.delivery_locked && <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700"><AlertTriangle className="size-4 shrink-0" /> The rider entered the customer's code wrong 5 times. Call the customer before issuing a new code.</p>}

        {delivery.stage === 'delivered' && (
          <div className="flex flex-col gap-3">
            <ProofPhoto url={delivery.proof_photo_url} cashCollected={delivery.cash_collected} />
            <OrderSettlementCard
              orderId={order.id}
              settlement={delivery.settlement}
              partnerName={delivery.rider?.full_name}
              role="store"
              onSettle={(payload) => settleMutation.mutateAsync(payload)}
            />
          </div>
        )}

        {delivery.stage !== 'not_started' && (
          <details className="group text-xs">
            <summary className="cursor-pointer list-none font-medium text-slate-500 hover:text-slate-800 [&::-webkit-details-marker]:hidden">Show times</summary>
            <div className="mt-3"><DeliveryTimeline timeline={delivery.timeline} /></div>
          </details>
        )}

        {open && delivery.stage !== 'not_started' && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {delivery.stage === 'ready_for_delivery' && <Button variant="outline" size="sm" onClick={() => run('request-rider')} disabled={action.isPending}><RotateCcw /> Search again</Button>}
            {(searching || waitingPickup) && <Button variant="outline" size="sm" onClick={() => run('new-pickup-code')} disabled={action.isPending}><KeyRound /> New pickup code</Button>}
            {(delivery.stage === 'dispatched' || delivery.delivery_locked) && <Button variant="outline" size="sm" onClick={() => run('new-delivery-code')} disabled={action.isPending}><RotateCcw /> New customer code</Button>}
            {(searching || waitingPickup) && <Button variant="outline" size="sm" onClick={() => run('cancel-rider')} disabled={action.isPending} className="text-rose-600 hover:text-rose-700"><XCircle /> Deliver it myself</Button>}
          </div>
        )}
      </div>
    </section>
  );
}
