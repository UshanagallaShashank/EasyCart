import { Tabs } from 'expo-router';
import { SignOutButton, hiddenPage, tabIcon, useTabOptions } from '@/components/nav';
import { useMyRider } from '@/features/rider/rider-api';

// While one of these pages is open, the tab next to it stays lit.
const ACTIVE_FOR = {
  'order/[id]': 'index',
  application: 'profile'
};

export default function RiderTabs() {
  const tabOptions = useTabOptions(ACTIVE_FOR);
  const { data: rider } = useMyRider();
  const approved = rider?.status === 'approved';
  return (
    <Tabs backBehavior="history" screenOptions={{ ...tabOptions, headerRight: () => <SignOutButton /> }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('bike') }} />
      {/* History and earnings only matter once the rider can deliver. */}
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('clock'), href: approved ? undefined : null }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: tabIcon('wallet'), href: approved ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
      <Tabs.Screen name="order/[id]" options={hiddenPage('Delivery')} />
      <Tabs.Screen name="application" options={hiddenPage('Partner application')} />
    </Tabs>
  );
}
