// One order in the owner's lists.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Badge } from '@/components/ui';
import { dateTime, price, shortId } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import type { Order } from '@/types/order';
import { orderStage } from './owner-api';

export function OrderRow({ order }: { order: Order }) {
  const stage = orderStage(order);
  return (
    <Pressable onPress={() => router.push(`/owner/order/${order.id}`)} style={styles.row}>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Text style={styles.id}>{shortId(order.id)}</Text>
          <Badge tone={stage.tone} label={stage.label} />
        </View>
        <Text style={text.small} numberOfLines={1}>{dateTime(order.created_at)} · {order.fulfillment_method === 'delivery' ? order.delivery_address : 'Pickup'}</Text>
      </View>
      <Text style={styles.total}>{price(order.total)}</Text>
      <Feather name="chevron-right" size={18} color={colors.textFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, ...shadow },
  id: { fontFamily: 'monospace', fontWeight: '700', color: colors.text },
  total: { fontSize: 15, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] }
});
