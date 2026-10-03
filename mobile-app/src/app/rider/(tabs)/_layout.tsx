import { Tabs } from 'expo-router';
import { SignOutButton, tabIcon, useTabOptions } from '@/components/nav';
import { useMyRider } from '@/features/rider/rider-api';

export default function RiderTabs() {
  const tabOptions = useTabOptions();
  const { data: rider } = useMyRider();
  const approved = rider?.status === 'approved';
  return (
    <Tabs screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('bike') }} />
      {/* History and earnings only matter once the rider can deliver. */}
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('clock'), href: approved ? undefined : null }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: tabIcon('wallet'), href: approved ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
