import { Tabs } from 'expo-router';
import { SignOutButton, tabIcon, useTabOptions } from '@/components/nav';
import { useOrders } from '@/features/owner/owner-api';

export default function OwnerTabs() {
  const tabOptions = useTabOptions();
  const { data: orders } = useOrders();
  const fresh = (orders ?? []).filter((order) => order.status === 'pending').length;
  return (
    <Tabs screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: tabIcon('clipboard'), tabBarBadge: fresh > 0 ? fresh : undefined }} />
      <Tabs.Screen name="delivery" options={{ title: 'Delivery', tabBarIcon: tabIcon('truck') }} />
      <Tabs.Screen name="products" options={{ title: 'Products', tabBarIcon: tabIcon('box') }} />
    </Tabs>
  );
}
