// Stores on the platform, with suspend and reactivate.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Badge, Button, Card, EmptyState, Loading, Pills, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { adminCalls, useAdminAction, useTenants } from '@/features/admin/admin-api';
import { errorMessage } from '@/lib/api';
import { date } from '@/lib/format';
import { space, text } from '@/theme/theme';

type Filter = 'active' | 'pending' | 'suspended' | 'all';

export default function Stores() {
  const { data, isLoading, refetch, isRefetching } = useTenants();
  const action = useAdminAction(adminCalls.tenantAction);
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('active');
  const stores = data ?? [];
  const visible = filter === 'all' ? stores : stores.filter((s) => s.status === filter);

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <Pills<Filter> options={(['active', 'pending', 'suspended', 'all'] as Filter[]).map((f) => ({ value: f, label: f === 'pending' ? 'Requests' : f.charAt(0).toUpperCase() + f.slice(1), count: f === 'all' ? stores.length : stores.filter((s) => s.status === f).length }))} value={filter} onChange={setFilter} />
      {isLoading ? <Loading /> : visible.length === 0 ? <EmptyState icon="shopping-bag" message="No stores here." /> : visible.map((store) => (
        <Card key={store.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={text.heading}>{store.name}</Text>
              <Text style={text.small}>{store.slug} · {store.owner_email ?? 'no owner'} · since {date(store.created_at)}</Text>
            </View>
            <Badge tone={store.status === 'suspended' ? 'danger' : store.status === 'pending' ? 'warning' : store.is_published ? 'success' : 'neutral'} label={store.status === 'active' ? (store.is_published ? 'Live' : 'Not published') : store.status} />
          </View>
          {store.status === 'active' && <Button small variant="danger" label="Suspend" onPress={() => action.mutate({ id: store.id, action: 'suspend' }, { onSuccess: () => toast('Store suspended', 'success'), onError: (e) => toast(errorMessage(e), 'error') })} />}
          {store.status === 'suspended' && <Button small variant="outline" label="Reactivate" onPress={() => action.mutate({ id: store.id, action: 'reactivate' }, { onSuccess: () => toast('Store reactivated', 'success'), onError: (e) => toast(errorMessage(e), 'error') })} />}
          {store.status === 'pending' && <Text style={text.small}>Review store requests with their documents on the website.</Text>}
        </Card>
      ))}
    </Screen>
  );
}
