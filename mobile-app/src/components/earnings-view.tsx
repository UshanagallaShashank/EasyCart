// Pieces both earnings screens share: a money amount, a row of daily bars, and the totals table.
import { StyleSheet, View } from 'react-native';
import { Text } from './text';
import { InfoRow } from './ui';
import { colors, radius, space } from '@/theme/theme';

export interface EarningsTotals {
  orders: number;
  items_value: number;
  commission: number;
  rider_pay: number;
  platform_earns: number;
  shop_keeps: number;
}

export interface EarningsDay extends EarningsTotals { date: string }

// Whole rupees without trailing .00, like the rest of the app.
export function rupees(amount: number): string {
  return `Rs. ${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// One bar per day. `pick` says which number the bars show (what the shop keeps, or what the platform earns).
export function DayBars({ days, pick, color }: { days: EarningsDay[]; pick(day: EarningsDay): number; color: string }) {
  const biggest = Math.max(...days.map(pick), 1);
  return (
    <View style={styles.bars}>
      {days.map((day) => {
        const value = pick(day);
        const [year, month, date] = day.date.split('-').map(Number);
        const weekday = SHORT_DAYS[new Date(year, month - 1, date).getDay()];
        return (
          <View key={day.date} style={styles.barColumn}>
            <Text style={styles.barValue} numberOfLines={1}>{value > 0 ? Math.round(value) : ''}</Text>
            <View style={styles.barTrack}><View style={[styles.barFill, { height: `${Math.max(value > 0 ? 8 : 0, (value / biggest) * 100)}%`, backgroundColor: color }]} /></View>
            <Text style={styles.barDay}>{weekday}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function TotalsRows({ totals, owner }: { totals: EarningsTotals; owner: boolean }) {
  return (
    <View style={{ gap: space.sm }}>
      <InfoRow label="Delivered orders" value={String(totals.orders)} />
      <InfoRow label="Items sold" value={rupees(totals.items_value)} />
      <InfoRow label={owner ? 'Platform fee' : 'Commission from shops'} value={owner ? `-${rupees(totals.commission)}` : rupees(totals.commission)} tone={owner ? 'danger' : undefined} />
      {!owner && <InfoRow label="Paid to riders" value={rupees(totals.rider_pay)} />}
      <View style={styles.divider}>
        <InfoRow label={owner ? 'You keep' : 'Platform earns'} value={rupees(owner ? totals.shop_keeps : totals.platform_earns)} strong tone="success" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6, height: 150 },
  barColumn: { flex: 1, alignItems: 'center', gap: 4, height: '100%' },
  barValue: { fontSize: 10, fontWeight: '700', color: colors.textMuted, height: 14 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end', backgroundColor: colors.borderSoft, borderRadius: radius.sm, overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: radius.sm },
  barDay: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  divider: { borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: space.sm }
});
