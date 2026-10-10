// Store overview, like the website's dashboard: greeting, headline numbers, orders that need you, recent orders, low stock.
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Button, Card, EmptyState, Loading, Notice, Screen, SectionTitle, StatCard, StatStrip } from '@/components/ui';
import { useCustomerCount, useOrders, useOwnStore, useOwnerProducts, useRatingsSummary, useStoreRefunds } from '@/features/owner/owner-api';
import { StarRating } from '@/components/star-rating';
import { OrderRow } from '@/features/owner/order-row';
import { SetupChecklist, ShareShopCard } from '@/features/owner/setup-checklist';
import { getBestSellers, getBusiestHour, getGreeting, getLowStock, getPendingCount, getRepeatRate, getRevenue, getToday } from '@/features/owner/overview-stats';
import { useSession } from '@/lib/session';
import { price } from '@/lib/format';
import { accentAt, colors, radius, space } from '@/theme/theme';

export default function OwnerOverview() {
  const { user } = useSession();
  const store = useOwnStore();
  const orders = useOrders();
  const products = useOwnerProducts();
  const customers = useCustomerCount();
  const ratings = useRatingsSummary();
  const refunds = useStoreRefunds();
  const waitingRefunds = (refunds.data ?? []).filter((refund) => refund.status === 'requested').length;
  if (orders.isLoading) return <Loading />;

  const list = [...(orders.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const needsYou = list.filter((o) => o.status === 'pending' || (o.status === 'confirmed' && o.fulfillment_status === 'not_started'));
  const lowStock = getLowStock(products.data ?? []);
  const today = getToday(list);
  const bestSellers = getBestSellers(list);
  const busiestHour = getBusiestHour(list);
  const repeatRate = getRepeatRate(list);

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


      {waitingRefunds > 0 ? (
        <Card title={`${waitingRefunds} refund ${waitingRefunds === 1 ? 'request' : 'requests'} waiting`} icon="rotate-ccw">
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Customers are waiting for your decision. Quick answers build trust.</Text>
          <Button label="Review refunds" onPress={() => router.push('/owner/refunds')} />
        </Card>
      ) : null}

      {store.data && <SetupChecklist store={store.data} productCount={products.data?.length ?? 0} />}

      <View style={styles.grid}>
        <StatCard label="Revenue" value={price(getRevenue(list)).replace('.00', '')} icon="dollar-sign" fg="#059669" bg="#d1fae5" hint="Excludes cancelled" />
        <StatCard label="Total orders" value={String(list.length)} icon="shopping-bag" fg="#0284c7" bg="#e0f2fe" />
        <StatCard label="Awaiting action" value={String(getPendingCount(list))} icon="clock" fg="#d97706" bg="#fef3c7" hint="Pending orders" />
        <StatCard label="Customers" value={customers.data === undefined ? '…' : String(customers.data)} icon="users" fg="#7c3aed" bg="#ede9fe" />
      </View>

      <SectionTitle>Today</SectionTitle>
      <StatStrip items={[
        { label: 'Orders today', value: String(today.orders) },
        { label: 'Earned today', value: price(today.revenue).replace('.00', '') },
        { label: 'Busiest hour', value: busiestHour ?? '-' }
      ]} />

      {bestSellers.length > 0 && (
        <Card title="Best sellers" icon="award" right={repeatRate === null ? undefined : <Text style={styles.repeat}>{repeatRate}% come back</Text>}>
          {bestSellers.map((item, index) => (
            <View key={item.name} style={styles.sellerRow}>
              <View style={[styles.rank, { backgroundColor: accentAt(index).bg }]}><Text style={[styles.rankText, { color: accentAt(index).fg }]}>{index + 1}</Text></View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={styles.sellerName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(8, (item.quantity / bestSellers[0].quantity) * 100)}%`, backgroundColor: accentAt(index).fg }]} /></View>
              </View>
              <Text style={styles.sellerQty}>{item.quantity} sold</Text>
            </View>
          ))}
        </Card>
      )}

      {ratings.data && ratings.data.count > 0 && (
        <Card title="Customer ratings" icon="star" right={<Text style={styles.repeat}>{ratings.data.count} {ratings.data.count === 1 ? 'rating' : 'ratings'}</Text>}>
          <View style={styles.ratingTop}>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingNumber}>{ratings.data.average_store?.toFixed(1)}</Text>
              <StarRating value={Math.round(ratings.data.average_store ?? 0)} size={16} />
              <Text style={styles.ratingLabel}>Store</Text>
            </View>
            {ratings.data.average_delivery !== null && (
              <View style={styles.ratingBox}>
                <Text style={styles.ratingNumber}>{ratings.data.average_delivery.toFixed(1)}</Text>
                <StarRating value={Math.round(ratings.data.average_delivery)} size={16} />
                <Text style={styles.ratingLabel}>Delivery</Text>
              </View>
            )}
          </View>
          {ratings.data.recent.map((item, index) => (
            <View key={index} style={styles.comment}>
              <StarRating value={item.store_stars} size={13} />
              {item.comment ? <Text style={styles.commentText}>{item.comment}</Text> : null}
              {(item.photo_urls ?? []).length > 0 ? (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {item.photo_urls!.map((url) => <Image key={url} source={{ uri: url }} style={styles.commentPhoto} contentFit="cover" />)}
                </View>
              ) : null}
            </View>
          ))}
        </Card>
      )}

      <SectionTitle right={<Button small variant="ghost" label="All orders" onPress={() => router.navigate('/owner/orders')} />}>Needs your attention</SectionTitle>
      {needsYou.length === 0 ? <EmptyState icon="check-circle" message="You are all caught up." /> : needsYou.slice(0, 5).map((order) => <OrderRow key={order.id} order={order} />)}

      <SectionTitle>Recent orders</SectionTitle>
      {list.length === 0 ? <EmptyState icon="shopping-bag" message="Orders will show up here as customers check out." /> : list.slice(0, 5).map((order) => <OrderRow key={order.id} order={order} />)}

      {store.data && <ShareShopCard store={store.data} />}

      <Card title="Low stock" icon="alert-triangle">
        {lowStock.length === 0 ? (
          <View style={styles.allGood}><Icon name="check-circle" size={24} color="#10b981" /><Text style={{ color: colors.textMuted, fontSize: 13 }}>All products are well stocked.</Text></View>
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
  ratingTop: { flexDirection: 'row', gap: space.md },
  ratingBox: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: '#fffbeb', borderRadius: radius.md, paddingVertical: space.md },
  ratingNumber: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  ratingLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  comment: { gap: 4, backgroundColor: colors.bg, borderRadius: radius.md, padding: space.md },
  commentPhoto: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.borderSoft },
  commentText: { fontSize: 13, color: colors.textSoft },
  repeat: { fontSize: 12, fontWeight: '700', color: '#059669' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rank: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 14, fontWeight: '800' },
  sellerName: { fontSize: 14, fontWeight: '600', color: colors.text },
  sellerQty: { fontSize: 12, fontWeight: '700', color: colors.textMuted, fontVariant: ['tabular-nums'] },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderSoft, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  allGood: { alignItems: 'center', gap: 6, paddingVertical: space.md },
  lowRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.warningSoft, borderRadius: radius.sm, paddingHorizontal: space.md, paddingVertical: 10 },
  lowCount: { color: '#d97706', fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] }
});
