import { Tabs } from 'expo-router';
import { SignOutButton, hiddenPage, tabIcon, useTabOptions } from '@/components/nav';
import { useRiders, useTenants } from '@/features/admin/admin-api';

// While one of these pages is open, the tab next to it stays lit.
const ACTIVE_FOR = {
  'rider/[id]': 'partners',
  'store/[id]': 'stores',
  users: 'more',
  sales: 'more',
  growth: 'more'
};

export default function AdminTabs() {
  const tabOptions = useTabOptions(ACTIVE_FOR);
  const { data } = useRiders();
  const waiting = (data?.riders ?? []).filter((rider) => rider.status === 'pending').length;
  const { data: stores } = useTenants();
  const requests = (stores ?? []).filter((store) => store.status === 'pending').length;
  return (
    <Tabs backBehavior="history" screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="stores" options={{ title: 'Stores', tabBarIcon: tabIcon('store'), tabBarBadge: requests > 0 ? requests : undefined }} />
      <Tabs.Screen name="partners" options={{ title: 'Partners', tabBarIcon: tabIcon('bike'), tabBarBadge: waiting > 0 ? waiting : undefined }} />
      <Tabs.Screen name="deliveries" options={{ title: 'Deliveries', tabBarIcon: tabIcon('truck') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: tabIcon('list') }} />
      <Tabs.Screen name="rider/[id]" options={hiddenPage('Delivery partner')} />
      <Tabs.Screen name="store/[id]" options={hiddenPage('Store')} />
      <Tabs.Screen name="users" options={hiddenPage('Users')} />
      <Tabs.Screen name="sales" options={hiddenPage('Sales')} />
      <Tabs.Screen name="growth" options={hiddenPage('Growth')} />
    </Tabs>
  );
}
