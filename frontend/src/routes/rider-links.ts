// Delivery partner navigation, in the same sidebar sections as the store dashboard.
// Until approved, a rider only needs their application and profile; afterwards, the application link goes away.
import { Bike, ClipboardCheck, History, IndianRupee, UserRoundCog } from 'lucide-react';
import type { NavItemDef, NavSection } from '@/components/app-shell/nav-types';

const HOME: NavItemDef = { to: '/rider', label: 'Home', icon: Bike, end: true };
const HISTORY: NavItemDef = { to: '/rider/history', label: 'History', icon: History };
const EARNINGS: NavItemDef = { to: '/rider/earnings', label: 'Earnings', icon: IndianRupee };
const PROFILE: NavItemDef = { to: '/rider/profile', label: 'Profile & documents', icon: UserRoundCog };
const APPLICATION: NavItemDef = { to: '/rider/onboarding', label: 'Application', icon: ClipboardCheck };

export function riderSections(isApproved: boolean): NavSection[] {
  return isApproved
    ? [{ title: 'Deliver', items: [HOME, HISTORY, EARNINGS] }, { title: 'Account', items: [PROFILE] }]
    : [{ title: 'Get started', items: [HOME, APPLICATION] }, { title: 'Account', items: [PROFILE] }];
}

// The phone bottom bar shows the places a rider goes most, with short labels.
export function riderBottomLinks(isApproved: boolean): { item: NavItemDef; label: string }[] {
  return isApproved
    ? [{ item: HOME, label: 'Home' }, { item: HISTORY, label: 'History' }, { item: EARNINGS, label: 'Earnings' }, { item: PROFILE, label: 'Profile' }]
    : [{ item: HOME, label: 'Home' }, { item: APPLICATION, label: 'Application' }, { item: PROFILE, label: 'Profile' }];
}

// Every rider page, for the top bar title (including ones not in the menu right now).
export const ALL_RIDER_SECTIONS: NavSection[] = [{ title: 'All', items: [HOME, HISTORY, EARNINGS, PROFILE, APPLICATION] }];
