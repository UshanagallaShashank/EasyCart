import { Tabs } from 'expo-router';
import { SignOutButton, tabIcon, useTabOptions } from '@/components/nav';
import { useRiders } from '@/features/admin/admin-api';

export default function AdminTabs() {
  const tabOptions = useTabOptions();
  const { data } = useRiders();
  const waiting = (data?.riders ?? []).filter((rider) => rider.status === 'pending').length;
  return (
    <Tabs screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="partners" options={{ title: 'Partners', tabBarIcon: tabIcon('users'), tabBarBadge: waiting > 0 ? waiting : undefined }} />
      <Tabs.Screen name="stores" options={{ title: 'Stores', tabBarIcon: tabIcon('store') }} />
      <Tabs.Screen name="deliveries" options={{ title: 'Deliveries', tabBarIcon: tabIcon('truck') }} />
    </Tabs>
  );
}
