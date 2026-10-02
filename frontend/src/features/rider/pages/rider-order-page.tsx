// One delivery from the rider's side: store and customer details, the bill, and the step they are on.
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Navigation, Phone, ReceiptText, Store, UserRound, PartyPopper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { format_price } from '@/lib/format-price';
import { ProofPhoto } from '@/features/delivery/components/proof-photo';
import { OrderSettlementCard } from '@/features/delivery/components/order-settlement-card';
import { formatDateTime, formatDistance, mapsLink } from '@/features/delivery/lib/delivery-labels';
import type { RiderOrder } from '@/features/delivery/types/delivery-types';
import { useRiderOrder } from '../hooks/use-rider-queries';
import { FormSection } from '../components/form-section';
import { PickupStep } from '../components/pickup-step';
import { DeliverStep } from '../components/deliver-step';
import { OfferCard } from '../components/offer-card';
import { RiderJourney } from '../components/rider-journey';

function NavigateButton({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-sky-700"><Navigation className="size-3.5" /> {label}</a>;
}

function Bill({ order }: { order: RiderOrder }) {
  const row = (label: string, value: string, className = 'text-slate-600') => <div className={`flex justify-between gap-4 ${className}`}><span>{label}</span><span className="tabular-nums">{value}</span></div>;
  return (
    <FormSection icon={ReceiptText} title="Items and bill" description={`${order.item_count} ${order.item_count === 1 ? 'item' : 'items'}`}>
      {order.items.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1.5 border-b border-slate-100 pb-3 text-sm">
          {order.items.map((item, index) => <li key={index} className="flex justify-between gap-3"><span className="min-w-0 truncate text-slate-800">{item.name}{item.variant_label && <span className="text-slate-400"> · {item.variant_label}</span>}</span><span className="shrink-0 font-medium text-slate-900">× {item.quantity}</span></li>)}
        </ul>
      )}
      <div className="flex flex-col gap-1.5 text-sm">
        {row('Items', format_price(order.subtotal))}
        {order.discount_amount > 0 && row('Discount', `-${format_price(order.discount_amount)}`, 'text-success')}
        {row('Delivery fee', format_price(order.delivery_fee))}
        {row('Order total', format_price(order.total), 'border-t border-slate-100 pt-1.5 font-semibold text-slate-900')}
        {row('Cash to collect', format_price(order.cash_to_collect), 'font-semibold text-amber-700')}
        {row('You earn', format_price(order.earning), 'font-semibold text-emerald-700')}
      </div>
    </FormSection>
  );
}

export function RiderOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useRiderOrder(id!);
  const navigate = useNavigate();
  // Back goes where the rider came from (Home or History); opened from a fresh link, it goes Home.
  const cameFromApp = useLocation().key !== 'default';
  const back = (
    <button type="button" onClick={() => (cameFromApp ? navigate(-1) : navigate('/rider'))} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
      <ArrowLeft className="size-3.5" /> Back
    </button>
  );

  if (isLoading) return <PageBody><Skeleton className="h-96 w-full rounded-2xl" /></PageBody>;
  if (isError || !order) return <div className="flex h-full flex-1 flex-col"><PageHeader title="Order not found" eyebrow={back} description="It may have been taken back by the store or offered to someone else." /></div>;

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title={`Order #${order.id.slice(0, 8)}`} eyebrow={back} description={`Placed ${formatDateTime(order.created_at)}`}>
      </PageHeader>
      <PageBody>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"><RiderJourney stage={order.stage} /></div>

        {order.stage === 'offered' && <OfferCard order={order} onAccepted={() => undefined} />}

        {order.stage === 'delivered' && (
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-start">
              <PartyPopper className="size-8 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-emerald-900">Delivered {formatDateTime(order.delivered_at)}</p>
                <p className="text-sm text-emerald-800">You earned {format_price(order.earning)} on this order.</p>
                <div className="mt-3 max-w-sm"><ProofPhoto url={order.proof_photo_url} cashCollected={order.cash_collected} /></div>
              </div>
            </section>
            <OrderSettlementCard side="rider" settlement={order.settlement} counterpart={order.store.name} />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-5">
            <FormSection icon={Store} title="Pick up from" description={order.stage === 'to_pickup' ? 'Go to the store first' : undefined}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-slate-900">{order.store.name}</p>
                  <p className="text-xs text-slate-500">{order.store.address ?? 'Address not set by the store'} · {formatDistance(order.store.distance_km)}</p>
                </div>
                {order.stage === 'to_pickup' && <NavigateButton href={mapsLink(order.store, order.store.address)} label="Navigate" />}
              </div>
            </FormSection>

            {order.customer && (
              <FormSection icon={UserRound} title="Deliver to">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-slate-900">{order.customer.name}</p>
                    <p className="text-xs break-words text-slate-500">{order.delivery_address}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {order.customer.phone_number && order.stage !== 'delivered' && <a href={`tel:${order.customer.phone_number}`} aria-label="Call customer" className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><Phone className="size-4" /></a>}
                    {order.stage === 'to_customer' && <NavigateButton href={mapsLink(null, order.delivery_address)} label="Navigate" />}
                  </div>
                </div>
              </FormSection>
            )}

            {order.stage === 'to_pickup' && <PickupStep order={order} />}
            {order.stage === 'to_customer' && <DeliverStep order={order} />}
          </div>
          <div className="flex min-w-0 flex-col gap-5"><Bill order={order} /></div>
        </div>
      </PageBody>
    </div>
  );
}
