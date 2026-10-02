// Store owner area.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';

export default function OwnerLayout() {
  return (
    <RoleGate role="tenant_owner">
      <Stack screenOptions={stackOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order' }} />
      </Stack>
    </RoleGate>
  );
}
