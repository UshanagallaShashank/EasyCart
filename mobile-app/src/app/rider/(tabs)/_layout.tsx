import { Tabs } from 'expo-router';
import { SignOutButton, tabIcon, tabOptions } from '@/components/nav';
import { useMyRider } from '@/features/rider/rider-api';

export default function RiderTabs() {
  const { data: rider } = useMyRider();
  const approved = rider?.status === 'approved';
  return (
    <Tabs screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('navigation') }} />
      {/* History and earnings only matter once the rider can deliver. */}
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('clock'), href: approved ? undefined : null }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: tabIcon('dollar-sign'), href: approved ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
    </Tabs>
  );
}
