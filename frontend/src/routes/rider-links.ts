// Delivery partner navigation, in the same sidebar sections as the store dashboard.
import { Bike, History, IndianRupee, UserRoundCog, ClipboardCheck } from 'lucide-react';
import type { NavSection } from '@/components/app-shell/nav-types';

export const RIDER_SECTIONS: NavSection[] = [
  { title: 'Deliver', items: [
    { to: '/rider', label: 'Home', icon: Bike, end: true },
    { to: '/rider/history', label: 'History', icon: History },
    { to: '/rider/earnings', label: 'Earnings', icon: IndianRupee }
  ] },
  { title: 'Account', items: [
    { to: '/rider/profile', label: 'Profile & documents', icon: UserRoundCog },
    { to: '/rider/onboarding', label: 'Application', icon: ClipboardCheck }
  ] }
];

// The phone bottom bar shows the four places a rider goes most.
export const RIDER_BOTTOM_LINKS = [RIDER_SECTIONS[0].items[0], RIDER_SECTIONS[0].items[1], RIDER_SECTIONS[0].items[2], RIDER_SECTIONS[1].items[0]];
