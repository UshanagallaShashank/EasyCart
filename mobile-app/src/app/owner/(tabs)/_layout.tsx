import { Tabs } from 'expo-router';
import { SignOutButton, hiddenPage, tabIcon, useTabOptions } from '@/components/nav';
import { useOrders, useOwnStore } from '@/features/owner/owner-api';
import { BrandProvider } from '@/lib/brand';
import { useNewOrderAlert } from '@/features/owner/use-new-order-alert';

// While one of these pages is open, the tab next to it stays lit.
const ACTIVE_FOR = {
  'order/[id]': 'orders',
  'product/[id]': 'products',
  earnings: 'more',
  refunds: 'more',
  customers: 'more',
  coupons: 'more',
  categories: 'more',
  'store-settings': 'more'
};

export default function OwnerTabs() {
  const tabOptions = useTabOptions(ACTIVE_FOR);
  const { data: orders } = useOrders();
  const { data: store } = useOwnStore();
  useNewOrderAlert(orders);
  const fresh = (orders ?? []).filter((order) => order.status === 'pending').length;
  return (
    <BrandProvider themeId={store?.color_theme}>
    <Tabs backBehavior="history" screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Overview', tabBarIcon: tabIcon('grid') }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: tabIcon('clipboard'), tabBarBadge: fresh > 0 ? fresh : undefined }} />
      <Tabs.Screen name="delivery" options={{ title: 'Delivery', tabBarIcon: tabIcon('truck') }} />
      <Tabs.Screen name="products" options={{ title: 'Products', tabBarIcon: tabIcon('box') }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: tabIcon('list') }} />
      <Tabs.Screen name="order/[id]" options={hiddenPage('Order')} />
      <Tabs.Screen name="product/[id]" options={hiddenPage('Product')} />
      <Tabs.Screen name="earnings" options={hiddenPage('Earnings')} />
      <Tabs.Screen name="refunds" options={hiddenPage('Refunds')} />
      <Tabs.Screen name="customers" options={hiddenPage('Customers')} />
      <Tabs.Screen name="coupons" options={hiddenPage('Coupons')} />
      <Tabs.Screen name="categories" options={hiddenPage('Categories')} />
      <Tabs.Screen name="store-settings" options={hiddenPage('Store settings')} />
    </Tabs>
    </BrandProvider>
  );
}
