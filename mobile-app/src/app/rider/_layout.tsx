// Delivery partner area.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';

export default function RiderLayout() {
  return (
    <RoleGate role="delivery_partner">
      <Stack screenOptions={stackOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Delivery' }} />
        <Stack.Screen name="application" options={{ title: 'Partner application' }} />
      </Stack>
    </RoleGate>
  );
}
