// Customer area: shop, cart, orders and account.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';
import { ShopProvider } from '@/features/shop/shop-context';

export default function ShopLayout() {
  return (
    <RoleGate role="customer">
      <ShopProvider>
        <Stack screenOptions={stackOptions}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="addresses" options={{ title: 'Delivery addresses' }} />
          <Stack.Screen name="order/[id]" options={{ title: 'Order' }} />
          <Stack.Screen name="store-request" options={{ title: 'Request a store' }} />
        </Stack>
      </ShopProvider>
    </RoleGate>
  );
}
