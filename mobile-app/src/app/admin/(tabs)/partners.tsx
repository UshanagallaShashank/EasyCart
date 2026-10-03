// Delivery partners: review queue first.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { Avatar, Badge, EmptyState, Loading, Pills, Screen } from '@/components/ui';
import { useRiders } from '@/features/admin/admin-api';
import { price } from '@/lib/format';
import { RIDER_STATUS, VEHICLE_LABELS } from '@/lib/delivery-labels';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import type { RiderStatus } from '@/types/delivery';

type Filter = 'pending' | 'approved' | 'online' | 'all';

export default function Partners() {
  const { data, isLoading, refetch, isRefetching } = useRiders();
  const [filter, setFilter] = useState<Filter>('pending');
  const riders = data?.riders ?? [];
  const match = (r: (typeof riders)[number], f: Filter) => f === 'all' || (f === 'online' ? r.status === 'approved' && r.is_online : r.status === (f as RiderStatus));
  const visible = riders.filter((r) => match(r, filter));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Pills<Filter> options={(['pending', 'approved', 'online', 'all'] as Filter[]).map((f) => ({ value: f, label: f === 'pending' ? 'In review' : f === 'online' ? 'Online now' : f === 'all' ? 'All' : 'Approved', count: riders.filter((r) => match(r, f)).length }))} value={filter} onChange={setFilter} />
      {isLoading ? <Loading /> : visible.length === 0 ? <EmptyState icon="users" message="No partners here." /> : visible.map((rider) => {
        const status = RIDER_STATUS[rider.status];
        return (
          <Pressable key={rider.id} onPress={() => router.push(`/admin/rider/${rider.id}`)} style={styles.row}>
            <Avatar name={rider.full_name} size={40} />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', flexWrap: 'wrap' }}><Text style={text.heading}>{rider.full_name}</Text><Badge tone={status.tone} label={status.label} /></View>
              <Text style={text.small} numberOfLines={1}>{rider.vehicle_type ? VEHICLE_LABELS[rider.vehicle_type] : 'No vehicle'} · {[rider.area, rider.city].filter(Boolean).join(', ') || 'Area not set'}</Text>
              <Text style={text.small}>{rider.deliveries} deliveries · cash {price(rider.cash_in_hand)}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, ...shadow } });
