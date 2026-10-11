// Rider home: application status until approved; then the online switch, new offers and current deliveries.
import { router } from 'expo-router';
import { Button, Card, EmptyState, HeroHeader, Loading, Notice, Screen, SectionTitle, StatStrip } from '@/components/ui';
import { useMyRider, useRiderHome } from '@/features/rider/rider-api';
import { ActiveOrderRow, OfferCard, OnlineCard } from '@/features/rider/rider-cards';
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
      <HeroHeader
        title={`Hi, ${rider.full_name.split(' ')[0]}`}
        subtitle={!approved ? 'Finish your application to start delivering' : (home.data?.rider ?? rider).is_online ? 'You are online and getting orders' : 'You are offline. Go online to get orders'}
        icon="bike"
      />
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
                  <SectionTitle>New offers</SectionTitle>
                  {home.data!.offers.map((order) => <OfferCard key={order.id} order={order} />)}
                </>
              )}
              <SectionTitle>Current deliveries</SectionTitle>
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
