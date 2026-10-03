import { Tabs } from 'expo-router';
import { BrandTitle, SignOutButton, tabIcon, useTabOptions } from '@/components/nav';
import { useShop } from '@/features/shop/shop-context';
import { useStore } from '@/features/shop/shop-api';

export default function ShopTabs() {
  const tabOptions = useTabOptions();
  const { count, slug } = useShop();
  const store = useStore(slug);
  return (
    <Tabs screenOptions={tabOptions}>
      <Tabs.Screen name="index" options={{ title: 'Shop', headerTitle: () => <BrandTitle>{store.data?.name ?? 'Shop'}</BrandTitle>, tabBarIcon: tabIcon('store') }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: tabIcon('shopping-cart'), tabBarBadge: count > 0 ? count : undefined }} />
      <Tabs.Screen name="orders" options={{ title: 'My orders', tabBarIcon: tabIcon('package') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('user'), headerRight: () => <SignOutButton /> }} />
    </Tabs>
  );
}
