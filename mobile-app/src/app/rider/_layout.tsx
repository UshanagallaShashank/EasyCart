// Delivery partner area.
import { Stack } from 'expo-router';
import { RoleGate, stackOptions } from '@/components/nav';

export default function RiderLayout() {
  return (
    <RoleGate role="delivery_partner">
      <Stack screenOptions={stackOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </RoleGate>
  );
}
