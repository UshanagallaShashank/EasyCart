// The customer's orders, newest first.
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { Badge, Button, EmptyState, Loading, Screen } from '@/components/ui';
import { ORDER_STATUS, useMyOrders } from '@/features/shop/shop-api';
import { date, price, shortId } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';

export default function OrdersScreen() {
  const { data, isLoading, refetch, isRefetching } = useMyOrders();
  const orders = [...(data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      {isLoading ? <Loading /> : orders.length === 0 ? (
        <EmptyState icon="package" message="You have not ordered anything yet." action={<Button label="Start shopping" variant="outline" onPress={() => router.navigate('/shop')} />} />
      ) : orders.map((order) => {
        const status = ORDER_STATUS[order.status];
        const live = order.fulfillment_method === 'delivery' && order.delivery_code && order.status !== 'cancelled';
        return (
          <Pressable key={order.id} onPress={() => router.push(`/shop/order/${order.id}`)} style={styles.row}>
            <View style={styles.tile}><Icon name={order.fulfillment_method === 'delivery' ? 'truck' : 'shopping-bag'} size={20} color={colors.primary} /></View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
                <Text style={styles.id}>{shortId(order.id)}</Text>
                <Badge tone={status.tone} label={status.label} />
                {live && <Badge tone="primary" label="Code ready" />}
              </View>
              <Text style={text.small}>{date(order.created_at)} · {order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.fulfillment_method === 'delivery' ? 'Delivery' : 'Pickup'}</Text>
            </View>
            <Text style={styles.total}>{price(order.total)}</Text>
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg, ...shadow },
  id: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  tile: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  total: { fontSize: 15, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }
});
