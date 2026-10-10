import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { hiddenPage, tabIcon, useTabOptions } from '@/components/nav';
import { ProfileMenu } from '@/components/profile-menu';
import { NotificationButton } from '@/components/notification-button';
import { useShop } from '@/features/shop/shop-context';
import { useT } from '@/lib/i18n';
import { useOrderAlerts } from '@/features/shop/use-order-alerts';

function HeaderRightActions() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 16 }}>
      <NotificationButton />
      <ProfileMenu />
    </View>
  );
}

// While one of these pages is open, the tab next to it stays lit.
const ACTIVE_FOR = {
  'product/[id]': 'index',
  checkout: 'cart',
  'order/[id]': 'orders',
  'order-placed': 'orders',
  pay: 'orders',
  nearby: 'index',
  addresses: 'account',
  'store-request': 'account'
};

export default function ShopTabs() {
  const tabOptions = useTabOptions(ACTIVE_FOR);
  const { lines } = useShop();
  const t = useT();
  useOrderAlerts();
  const units = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Tabs backBehavior="history" screenOptions={{ ...tabOptions, headerRight: () => <HeaderRightActions /> }}>
      <Tabs.Screen name="index" options={{ title: t('Shop'), headerShown: false, tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="cart" options={{ title: t('Cart'), tabBarIcon: tabIcon('shopping-cart'), tabBarBadge: units > 0 ? units : undefined }} />
      <Tabs.Screen name="orders" options={{ title: t('My orders'), tabBarLabel: t('Orders'), tabBarIcon: tabIcon('clipboard') }} />
      <Tabs.Screen name="account" options={{ title: t('Account'), tabBarIcon: tabIcon('user') }} />
      <Tabs.Screen name="product/[id]" options={hiddenPage(t('Product'))} />
      <Tabs.Screen name="checkout" options={hiddenPage(t('Checkout'))} />
      <Tabs.Screen name="pay" options={hiddenPage(t('Pay online'))} />
      <Tabs.Screen name="nearby" options={hiddenPage(t('Shops near you'))} />
      <Tabs.Screen name="order/[id]" options={hiddenPage(t('Order'))} />
      <Tabs.Screen name="order-placed" options={{ title: t('Order placed'), href: null, headerShown: false }} />
      <Tabs.Screen name="addresses" options={hiddenPage(t('Delivery addresses'))} />
      <Tabs.Screen name="store-request" options={hiddenPage(t('Request a store'))} />
    </Tabs>
  );
}
