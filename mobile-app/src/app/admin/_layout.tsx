// Platform admin area.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';

export default function AdminLayout() {
  return (
    <RoleGate role="platform_admin">
      <Stack screenOptions={stackOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="rider/[id]" options={{ title: 'Delivery partner' }} />
        <Stack.Screen name="store/[id]" options={{ title: 'Store' }} />
        <Stack.Screen name="users" options={{ title: 'Users' }} />
        <Stack.Screen name="sales" options={{ title: 'Sales' }} />
        <Stack.Screen name="growth" options={{ title: 'Growth' }} />
      </Stack>
    </RoleGate>
  );
}
