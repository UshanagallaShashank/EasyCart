// Stores on the platform and store requests. Tap a store for its details; requests can be approved or rejected here.
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { Badge, Button, EmptyState, Loading, Pills, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { requestCalls, useAdminAction, useTenants, type AdminTenant } from '@/features/admin/admin-api';
import { errorMessage } from '@/lib/api';
import { date } from '@/lib/format';
import { colors, radius, shadow, space, text } from '@/theme/theme';

type Filter = 'requests' | 'live' | 'unpublished' | 'suspended' | 'all';

// The same groups as the website's Stores page.
function matches(store: AdminTenant, filter: Filter) {
  if (filter === 'requests') return store.status === 'pending';
  if (filter === 'live') return store.status === 'active' && store.is_published;
  if (filter === 'unpublished') return store.status === 'active' && !store.is_published;
  if (filter === 'suspended') return store.status === 'suspended';
  return true;
}

const LABELS: Record<Filter, string> = { requests: 'Requests', live: 'Live', unpublished: 'Not published', suspended: 'Suspended', all: 'All' };

export default function Stores() {
  const { data, isLoading, refetch, isRefetching } = useTenants();
  const approve = useAdminAction(requestCalls.approve);
  const toast = useToast();
  const stores = data ?? [];
  const requestCount = stores.filter((store) => store.status === 'pending').length;
  const [filter, setFilter] = useState<Filter>(requestCount > 0 ? 'requests' : 'all');
  const visible = stores.filter((store) => matches(store, filter));

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Pills<Filter> options={(Object.keys(LABELS) as Filter[]).map((value) => ({ value, label: LABELS[value], count: stores.filter((store) => matches(store, value)).length }))} value={filter} onChange={setFilter} />
      {isLoading ? <Loading /> : visible.length === 0 ? <EmptyState icon="shopping-bag" message={filter === 'requests' ? 'No store requests waiting.' : 'No stores here.'} /> : visible.map((store) => (
        <View key={store.id} style={styles.row}>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/admin/store/${store.id}`)} style={({ pressed }) => [styles.top, pressed && { opacity: 0.8 }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={text.heading} numberOfLines={1}>{store.name}</Text>
              <Text style={text.small} numberOfLines={1}>{store.owner_username ?? store.owner_email ?? 'no owner'} · since {date(store.created_at)}</Text>
            </View>
            <Badge tone={store.status === 'suspended' || store.status === 'rejected' ? 'danger' : store.status === 'pending' ? 'warning' : store.is_published ? 'success' : 'neutral'} label={store.status === 'active' ? (store.is_published ? 'Live' : 'Not published') : store.status === 'pending' ? 'Request' : store.status} />
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
          {store.status === 'pending' && (
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Button small variant="outline" icon="file-text" label="Review" onPress={() => router.push(`/admin/store/${store.id}`)} />
              <Button small variant="success" icon="check" label="Approve" loading={approve.isPending} onPress={() => approve.mutate(store.id, { onSuccess: () => toast('Store approved', 'success'), onError: (e) => toast(errorMessage(e), 'error') })} />
            </View>
          )}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: '#e8edf3', padding: space.lg, ...shadow },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md }
});
