// Platform overview, like the website's admin home: banner, headline numbers, what needs a decision, and top stores.
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon, type IconName } from '@/components/icon';
import { Card, InfoRow, Loading, Screen, SectionTitle, StatCard } from '@/components/ui';
import { useRiders, useStats, useTenants } from '@/features/admin/admin-api';
import { useSession } from '@/lib/session';
import { price } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export default function AdminOverview() {
  const { user } = useSession();
  const stats = useStats();
  const tenants = useTenants();
  const riders = useRiders();
  if (stats.isLoading || !stats.data) return <Loading />;

  const t = stats.data.totals;
  const requests = (tenants.data ?? []).filter((store) => store.status === 'pending').length;
  const partnersInReview = (riders.data?.riders ?? []).filter((rider) => rider.status === 'pending').length;

  return (
    <Screen onRefresh={() => { void stats.refetch(); void tenants.refetch(); void riders.refetch(); }} refreshing={stats.isRefetching}>
      <LinearGradient colors={['#38bdf8', '#0ea5e9', '#0284c7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <Text style={styles.hello}>{greeting()}, {user?.username}</Text>
        <Text style={styles.bannerTitle}>Platform at a glance</Text>
      </LinearGradient>

      <View style={styles.grid}>
        <StatCard label="Sales" value={price(t.gmv).replace('.00', '')} icon="dollar-sign" fg="#059669" bg="#d1fae5" hint="All stores" />
        <StatCard label="Orders" value={String(t.orders)} icon="shopping-bag" fg="#0284c7" bg="#e0f2fe" hint={`${t.pending_orders} waiting`} />
        <StatCard label="Stores" value={String(t.stores)} icon="store" fg="#d97706" bg="#fef3c7" hint={`${t.active_stores} live`} />
        <StatCard label="Customers" value={String(t.customers)} icon="users" fg="#7c3aed" bg="#ede9fe" hint={`${t.owners} store owners`} />
      </View>

      <SectionTitle>Needs your decision</SectionTitle>
      <Action icon="store" one="store request" many="store requests" idle="Store requests" count={requests} done="No requests waiting" href="/admin/stores" />
      <Action icon="bike" one="delivery partner in review" many="delivery partners in review" idle="Delivery partners in review" count={partnersInReview} done="No applications waiting" href="/admin/partners" />

      <Card title="Top stores" icon="award">
        {stats.data.top_stores.length === 0 ? <Text style={text.small}>No sales yet.</Text> : stats.data.top_stores.slice(0, 5).map((store) => <InfoRow key={store.tenant_id} label={`${store.name} · ${store.orders} orders`} value={price(store.revenue)} />)}
      </Card>
    </Screen>
  );
}

function Action({ icon, one, many, idle, count, done, href }: { icon: IconName; one: string; many: string; idle: string; count: number; done: string; href: '/admin/stores' | '/admin/partners' }) {
  return (
    <Pressable accessibilityRole="button" onPress={() => router.navigate(href)} style={({ pressed }) => [styles.action, pressed && { opacity: 0.9 }]}>
      <View style={[styles.actionIcon, { backgroundColor: count > 0 ? '#fef3c7' : '#d1fae5' }]}><Icon name={count > 0 ? icon : 'check-circle'} size={20} color={count > 0 ? '#d97706' : '#059669'} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={text.heading}>{count > 0 ? `${count} ${count === 1 ? one : many}` : idle}</Text>
        <Text style={text.small}>{count > 0 ? 'Tap to review' : done}</Text>
      </View>
      <Icon name="chevron-right" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: radius.xl, padding: space.xl, gap: space.xs, overflow: 'hidden' },
  hello: { color: '#e0f2fe', fontSize: 13 },
  bannerTitle: { color: colors.white, fontSize: 24, fontWeight: '900', letterSpacing: -0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg, ...shadow },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }
});
