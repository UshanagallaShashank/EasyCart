// Store overview, like the website's dashboard: greeting, headline numbers, orders that need you, recent orders, low stock.
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Button, Card, EmptyState, Loading, Notice, Screen, SectionTitle, StatCard } from '@/components/ui';
import { useCustomerCount, useOrders, useOwnStore, useOwnerProducts } from '@/features/owner/owner-api';
import { OrderRow } from '@/features/owner/order-row';
import { getGreeting, getLowStock, getPendingCount, getRevenue } from '@/features/owner/overview-stats';
import { useSession } from '@/lib/session';
import { price } from '@/lib/format';
import { colors, radius, space } from '@/theme/theme';

export default function OwnerOverview() {
  const { user } = useSession();
  const store = useOwnStore();
  const orders = useOrders();
  const products = useOwnerProducts();
  const customers = useCustomerCount();
  if (orders.isLoading) return <Loading />;

  const list = [...(orders.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const needsYou = list.filter((o) => o.status === 'pending' || (o.status === 'confirmed' && o.fulfillment_status === 'not_started'));
  const lowStock = getLowStock(products.data ?? []);

  return (
    <Screen onRefresh={() => { void orders.refetch(); void products.refetch(); void customers.refetch(); }} refreshing={orders.isRefetching}>
      <LinearGradient colors={['#e0f2fe', '#e0f4ff', '#dbeafe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
        <Text style={styles.bannerHello}>{getGreeting()}, {user?.username}</Text>
        <Text style={styles.bannerTitle} numberOfLines={2}>{store.data?.name ?? 'Your store'} at a glance</Text>
        <View style={styles.chips}>
          <Chip icon="package" label="Products" onPress={() => router.navigate('/owner/products')} />
          <Chip icon="shopping-bag" label="Orders" onPress={() => router.navigate('/owner/orders')} />
          <Chip icon="truck" label="Delivery" onPress={() => router.navigate('/owner/delivery')} />
        </View>
      </LinearGradient>

      {store.data && !store.data.is_published && <Notice tone="warning" icon="eye-off">Your store is not published, so customers cannot see it. Publish it from the website's Store settings.</Notice>}
      {store.data && store.data.latitude == null && <Notice icon="map-pin">Pin your store location in Store settings on the website so deliveries go to the nearest rider.</Notice>}

      <View style={styles.grid}>
        <StatCard label="Revenue" value={price(getRevenue(list)).replace('.00', '')} icon="dollar-sign" fg="#059669" bg="#d1fae5" hint="Excludes cancelled" />
        <StatCard label="Total orders" value={String(list.length)} icon="shopping-bag" fg="#0284c7" bg="#e0f2fe" />
        <StatCard label="Awaiting action" value={String(getPendingCount(list))} icon="clock" fg="#d97706" bg="#fef3c7" hint="Pending orders" />
        <StatCard label="Customers" value={customers.data === undefined ? '…' : String(customers.data)} icon="users" fg="#7c3aed" bg="#ede9fe" />
      </View>

      <SectionTitle right={<Button small variant="ghost" label="All orders" onPress={() => router.navigate('/owner/orders')} />}>Needs your attention</SectionTitle>
      {needsYou.length === 0 ? <EmptyState icon="check-circle" message="You are all caught up." /> : needsYou.slice(0, 5).map((order) => <OrderRow key={order.id} order={order} />)}

      <SectionTitle>Recent orders</SectionTitle>
      {list.length === 0 ? <EmptyState icon="shopping-bag" message="Orders will show up here as customers check out." /> : list.slice(0, 5).map((order) => <OrderRow key={order.id} order={order} />)}

      <Card title="Low stock" icon="alert-triangle">
        {lowStock.length === 0 ? (
          <View style={styles.allGood}><Icon name="check-circle" size={22} color="#10b981" /><Text style={{ color: colors.textMuted, fontSize: 13 }}>All products are well stocked.</Text></View>
        ) : lowStock.slice(0, 5).map((product) => (
          <View key={product.id} style={styles.lowRow}>
            <Text style={{ flex: 1, color: colors.textSoft, fontSize: 14 }} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.lowCount}>{product.stock_quantity} left</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function Chip({ icon, label, onPress }: { icon: 'package' | 'shopping-bag' | 'truck'; label: string; onPress(): void }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]} onPress={onPress}>
      <Icon name={icon} size={14} color={colors.white} />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: radius.xl, padding: space.xl, gap: space.sm, overflow: 'hidden', borderWidth: 1, borderColor: '#bae6fd' },
  bannerHello: { color: '#0284c7', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bannerTitle: { color: '#0f172a', fontSize: 24, lineHeight: 29, fontWeight: '900', letterSpacing: -0.6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: '#0284c7', fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  allGood: { alignItems: 'center', gap: 6, paddingVertical: space.md },
  lowRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.warningSoft, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 10 },
  lowCount: { color: '#d97706', fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] }
});
