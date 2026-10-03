// Orders the rider has delivered.
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { EmptyState, Loading, Screen } from '@/components/ui';
import { useRiderHistory } from '@/features/rider/rider-api';
import { dateTime, price, shortId } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useRiderHistory();
  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      {isLoading ? <Loading /> : (data?.length ?? 0) === 0 ? <EmptyState icon="clock" message="No deliveries yet. Completed orders show here." /> : data!.map((order) => (
        <Pressable key={order.id} onPress={() => router.push(`/rider/order/${order.id}`)} style={styles.row}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={text.heading} numberOfLines={1}>{order.store.name} → {order.customer?.name ?? 'Customer'}</Text>
            <Text style={text.small}>{dateTime(order.delivered_at)} · {shortId(order.id)} · cash {price(order.cash_collected ?? 0)}</Text>
          </View>
          <Text style={{ fontWeight: '700', color: colors.success }}>+{price(order.earning)}</Text>
          <Icon name="chevron-right" size={18} color={colors.textFaint} />
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, ...shadow } });
