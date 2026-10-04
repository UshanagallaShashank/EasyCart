// Store owner area.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';

export default function OwnerLayout() {
  return (
    <RoleGate role="tenant_owner">
      <Stack screenOptions={stackOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order' }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
        <Stack.Screen name="customers" options={{ title: 'Customers' }} />
        <Stack.Screen name="coupons" options={{ title: 'Coupons' }} />
        <Stack.Screen name="categories" options={{ title: 'Categories' }} />
        <Stack.Screen name="store-settings" options={{ title: 'Store settings' }} />
      </Stack>
    </RoleGate>
  );
}
