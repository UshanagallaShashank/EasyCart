import { Tabs } from 'expo-router';
import { SignOutButton, tabIcon, tabOptions } from '@/components/nav';
import { useShop } from '@/features/shop/shop-context';

export default function ShopTabs() {
  const { count } = useShop();
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen name="index" options={{ title: 'Shop', tabBarIcon: tabIcon('shopping-bag') }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: tabIcon('shopping-cart'), tabBarBadge: count > 0 ? count : undefined }} />
      <Tabs.Screen name="orders" options={{ title: 'My orders', tabBarIcon: tabIcon('package') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('user'), headerRight: () => <SignOutButton /> }} />
    </Tabs>
  );
}
