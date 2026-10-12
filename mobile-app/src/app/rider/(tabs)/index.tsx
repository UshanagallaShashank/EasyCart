// Rider home: application status until approved; then the online switch, new offers and current deliveries.
import { router } from 'expo-router';
import { Button, Card, EmptyState, HeroHeader, Loading, Notice, Screen, StatStrip } from '@/components/ui';
import { useMyRider, useRiderHome } from '@/features/rider/rider-api';
import { ActiveOrderRow, ColorSectionTitle, OfferCard, OnlineCard } from '@/features/rider/rider-cards';
import { ApplicationStatus } from '@/features/rider/application-status';
import { price } from '@/lib/format';

const RULES = [
  "Never hand over an order without the customer's 6-digit code.",
  'Take the delivery photo at the door, showing the package.',
  'Collect exactly the amount shown.',
  'Wear a helmet and follow traffic rules.'
];

export default function RiderHome() {
  const { data: rider, isLoading } = useMyRider();
  const approved = rider?.status === 'approved';
  const home = useRiderHome(approved);

  if (isLoading || !rider) return <Loading />;

  return (
    <Screen onRefresh={() => void home.refetch()} refreshing={home.isRefetching}>
      {/* Once approved, the online card greets the rider, so the banner is only for riders still applying. */}
      {!approved && <HeroHeader title={`Hi, ${rider.full_name.split(' ')[0]}`} subtitle="Finish your application to start delivering" icon="bike" />}
      {!approved && (
        <>
          <ApplicationStatus rider={rider} />
          {(rider.status === 'draft' || rider.status === 'rejected') && <Button icon="edit-3" label="Continue application" onPress={() => router.push('/rider/application')} />}
        </>
      )}
      {approved && (
        <>
          <OnlineCard rider={home.data?.rider ?? rider} />
          <StatStrip items={[
            { label: 'Deliveries today', value: String(home.data?.summary.deliveries_today ?? 0) },
            { label: 'Earned today', value: price(home.data?.summary.earnings_today ?? 0).replace('.00', '') },
            { label: 'Cash to hand in', value: price(home.data?.summary.cash_in_hand ?? 0).replace('.00', '') }
          ]} />
          {home.isLoading ? <Loading /> : (
            <>
              {home.data?.at_order_limit && (
                <Notice tone="warning" icon="package">You are carrying {home.data.max_active_orders ?? 2} orders, the most at one time. New orders show here again once you deliver one.</Notice>
              )}
              {(home.data?.offers.length ?? 0) > 0 && (
                <>
                  <ColorSectionTitle kind="offer" title="New offers" count={home.data!.offers.length} caption="Waiting for a rider. The first to accept gets it." />
                  {home.data!.offers.map((order) => <OfferCard key={order.id} order={order} />)}
                </>
              )}
              {(home.data?.passed?.length ?? 0) > 0 && (
                <>
                  <ColorSectionTitle kind="passed" title="You passed on" count={home.data!.passed!.length} caption="Nobody has taken these yet. You can still take one." />
                  {home.data!.passed!.map((order) => <OfferCard key={order.id} order={order} passed />)}
                </>
              )}
              <ColorSectionTitle kind="mine" title="Your deliveries" count={home.data?.active.length ?? 0} caption="Orders you accepted. Tap one to see the next step." />
              {(home.data?.active.length ?? 0) > 0
                ? home.data!.active.map((order) => <ActiveOrderRow key={order.id} order={order} />)
                : <EmptyState icon="navigation" message={home.data?.rider.is_online ? 'Waiting for orders near you. This screen updates by itself.' : 'You are offline. Go online to get orders.'} />}
            </>
          )}
        </>
      )}
      <Card title="Safe delivery rules" icon="shield">
        {RULES.map((rule) => <Notice key={rule} tone="neutral" icon="check">{rule}</Notice>)}
      </Card>
    </Screen>
  );
}
