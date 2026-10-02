// Rider home: application status until approved; then the online switch, new offers, current deliveries and today's numbers.
import { useNavigate } from 'react-router-dom';
import { Bike, IndianRupee, ShieldCheck, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { EmptyState } from '@/components/empty-state';
import { format_price } from '@/lib/format-price';
import { useMyRider, useRiderHome } from '../hooks/use-rider-queries';
import { ApplicationStatusCard } from '../components/application-status-card';
import { OnlineToggleCard } from '../components/online-toggle-card';
import { OfferCard } from '../components/offer-card';
import { ActiveDeliveryCard } from '../components/active-delivery-card';
import { StatTile } from '../components/stat-tile';

const SAFETY_TIPS = [
  'Never hand over an order without the customer\'s 6-digit code.',
  'Take the delivery photo at the door, showing the package.',
  'Collect exactly the amount shown. Do not accept extra or less.',
  'Wear a helmet and follow traffic rules. No order is worth a risk.'
];

export function RiderHomePage() {
  const navigate = useNavigate();
  const { data: rider, isLoading: riderLoading } = useMyRider();
  const approved = rider?.status === 'approved';
  const { data: home, isLoading: homeLoading } = useRiderHome(approved);

  if (riderLoading || !rider) return <PageBody><Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-64 w-full rounded-2xl" /></PageBody>;

  const firstName = rider.full_name.split(' ')[0];

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title={`Hi, ${firstName}`} description={approved ? 'Stay online to get orders near you.' : 'Finish your application to start delivering.'} />
      <PageBody>
        {!approved && <ApplicationStatusCard rider={rider} showLink />}
        {approved && (
          <>
            <OnlineToggleCard rider={home?.rider ?? rider} />
            <div className="grid grid-cols-3 gap-3">
              <StatTile icon={Bike} label="Today" value={String(home?.summary.deliveries_today ?? 0)} hint="deliveries" />
              <StatTile icon={IndianRupee} label="Earned today" value={format_price(home?.summary.earnings_today ?? 0)} />
              <StatTile icon={Wallet} label="Cash in hand" value={format_price(home?.summary.cash_in_hand ?? 0)} hint="hand in to EasyCart" />
            </div>

            {homeLoading ? <Skeleton className="h-48 w-full rounded-2xl" /> : (
              <>
                {(home?.offers.length ?? 0) > 0 && (
                  <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-slate-900">New offers</h2>
                    <div className="grid gap-3 md:grid-cols-2">{home!.offers.map((order) => <OfferCard key={order.id} order={order} onAccepted={(id) => navigate(`/rider/orders/${id}`)} />)}</div>
                  </section>
                )}
                <section className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-slate-900">Current deliveries</h2>
                  {(home?.active.length ?? 0) > 0
                    ? <div className="grid gap-3 md:grid-cols-2">{home!.active.map((order) => <ActiveDeliveryCard key={order.id} order={order} />)}</div>
                    : <EmptyState message={home?.rider.is_online ? 'Waiting for orders near you. Keep this screen open; it refreshes on its own.' : 'You are offline. Go online to get orders.'} />}
                </section>
              </>
            )}
          </>
        )}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldCheck className="size-4 text-emerald-500" /> Safe delivery rules</h2>
          <ul className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">{SAFETY_TIPS.map((tip) => <li key={tip} className="rounded-xl bg-slate-50 px-3 py-2">{tip}</li>)}</ul>
        </section>
      </PageBody>
    </div>
  );
}
