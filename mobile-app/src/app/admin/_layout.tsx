// Platform admin area.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';

export default function AdminLayout() {
  return (
    <RoleGate role="platform_admin">
      <Stack screenOptions={stackOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="rider/[id]" options={{ title: 'Delivery partner' }} />
      </Stack>
    </RoleGate>
  );
}
