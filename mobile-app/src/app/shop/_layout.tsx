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
        </Stack>
      </ShopProvider>
    </RoleGate>
  );
}
