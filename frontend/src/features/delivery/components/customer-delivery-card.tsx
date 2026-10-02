// The customer's view of their delivery: the secret code to give the rider, who is coming, and proof once delivered.
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCustomerOrderDelivery } from '../api/handover-api';
import { deliveryStageLabel } from '../lib/delivery-labels';
import { ToneBadge } from './tone-badge';
import { HandoverRiderCard } from './handover-rider-card';
import { DeliveryTimeline } from './delivery-timeline';
import { ProofPhoto } from './proof-photo';

const LIVE = ['not_started', 'ready_for_delivery', 'rider_assigned', 'dispatched'];

export function CustomerDeliveryCard({ orderId }: { orderId: string }) {
  const { data: delivery, isLoading } = useQuery({
    queryKey: ['my-orders', orderId, 'delivery'],
    queryFn: async () => (await getCustomerOrderDelivery(orderId)).delivery,
    refetchInterval: (query) => (LIVE.includes(query.state.data?.stage ?? '') ? 20_000 : false)
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (!delivery) return null;
  const stage = deliveryStageLabel(delivery.stage, delivery.rider_offer_status);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Delivery</CardTitle>
        <ToneBadge tone={stage.tone} label={stage.label} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {delivery.delivery_code && (
          <div className="rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 p-4 text-center text-white shadow-md shadow-sky-500/20">
            <p className="flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider text-sky-100 uppercase"><ShieldCheck className="size-3.5" /> Your delivery code</p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-[0.25em]">{delivery.delivery_code}</p>
            <p className="mt-1.5 text-[11px] text-sky-100">Share it only after you have your order in hand. Never share it on a call.</p>
          </div>
        )}
        {delivery.delivery_locked && <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> Your code was entered wrong too many times, so it is locked for your safety. The store will give you a new one.</p>}
        {delivery.rider && <HandoverRiderCard rider={delivery.rider} caption={delivery.stage === 'delivered' ? 'Delivered by' : 'Your delivery partner'} />}
        {delivery.rider && delivery.stage !== 'delivered' && <p className="text-[11px] text-slate-500">Check the name, photo and number plate match the person at your door.</p>}
        {delivery.stage === 'delivered' && <ProofPhoto url={delivery.proof_photo_url} cashCollected={delivery.cash_collected} />}
        <DeliveryTimeline timeline={delivery.timeline} />
      </CardContent>
    </Card>
  );
}
