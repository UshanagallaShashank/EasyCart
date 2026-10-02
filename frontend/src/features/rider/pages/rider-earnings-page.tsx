// What the rider has earned, the cash they still hold for EasyCart, and payouts so far.
import { Banknote, Bike, CalendarDays, HandCoins, IndianRupee, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { PageBody } from '@/components/page-body';
import { format_price } from '@/lib/format-price';
import { EarningsChart } from '@/features/delivery/components/earnings-chart';
import { SettlementList } from '@/features/delivery/components/settlement-list';
import { useRiderEarnings } from '../hooks/use-rider-queries';
import { StatTile } from '../components/stat-tile';
import { FormSection } from '../components/form-section';

export function RiderEarningsPage() {
  const { data, isLoading } = useRiderEarnings();

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <PageHeader title="Earnings" description="You earn the delivery fee on every order. Cash you collect is handed in to EasyCart." />
      <PageBody>
        {isLoading || !data ? <Skeleton className="h-96 w-full rounded-2xl" /> : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              <StatTile icon={IndianRupee} label="Today" value={format_price(data.summary.earnings_today)} hint={`${data.summary.deliveries_today} deliveries`} />
              <StatTile icon={CalendarDays} label="Last 7 days" value={format_price(data.summary.earnings_this_week)} hint={`${data.summary.deliveries_this_week} deliveries`} />
              <StatTile icon={Bike} label="All time" value={format_price(data.summary.earnings)} hint={`${data.summary.deliveries} deliveries`} />
              <StatTile icon={Wallet} label="Cash in hand" value={format_price(data.summary.cash_in_hand)} hint="Hand this in to EasyCart" />
              <StatTile icon={HandCoins} label="Payout due" value={format_price(data.summary.payout_due)} hint="Paid to your UPI" />
              <StatTile icon={Banknote} label="Paid out" value={format_price(data.summary.paid_out)} />
            </div>
            <EarningsChart daily={data.daily} />
            <FormSection icon={HandCoins} title="Cash and payouts" description="Recorded by the EasyCart team when you hand in cash or get paid.">
              <SettlementList settlements={data.settlements} />
            </FormSection>
          </>
        )}
      </PageBody>
    </div>
  );
}
