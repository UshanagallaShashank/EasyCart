import { Tabs } from 'expo-router';
import { SignOutButton, tabIcon, useTabOptions } from '@/components/nav';
import { useRiders, useTenants } from '@/features/admin/admin-api';

export default function AdminTabs() {
  const tabOptions = useTabOptions();
  const { data } = useRiders();
  const waiting = (data?.riders ?? []).filter((rider) => rider.status === 'pending').length;
  const { data: stores } = useTenants();
  const requests = (stores ?? []).filter((store) => store.status === 'pending').length;
  return (
    <Tabs screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="stores" options={{ title: 'Stores', tabBarIcon: tabIcon('store'), tabBarBadge: requests > 0 ? requests : undefined }} />
      <Tabs.Screen name="partners" options={{ title: 'Partners', tabBarIcon: tabIcon('bike'), tabBarBadge: waiting > 0 ? waiting : undefined }} />
      <Tabs.Screen name="deliveries" options={{ title: 'Deliveries', tabBarIcon: tabIcon('truck') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: tabIcon('list') }} />
    </Tabs>
  );
}
