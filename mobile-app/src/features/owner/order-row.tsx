// One order in the owner's lists.
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui';
import { dateTime, price, shortId } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import type { Order } from '@/types/order';
import { orderStage } from './owner-api';

export function OrderRow({ order }: { order: Order }) {
  const stage = orderStage(order);
  return (
    <Pressable onPress={() => router.push(`/owner/order/${order.id}`)} style={styles.row}>
      <View style={styles.tile}><Icon name={order.fulfillment_method === 'delivery' ? 'truck' : 'shopping-bag'} size={20} color={colors.primary} /></View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Text style={styles.id}>{shortId(order.id)}</Text>
          <Badge tone={stage.tone} label={stage.label} />
        </View>
        <Text style={text.small} numberOfLines={1}>{dateTime(order.created_at)} · {order.fulfillment_method === 'delivery' ? order.delivery_address : 'Pickup'}</Text>
      </View>
      <Text style={styles.total}>{price(order.total)}</Text>
      <Icon name="chevron-right" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg, ...shadow },
  id: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  tile: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  total: { fontSize: 15, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] }
});
