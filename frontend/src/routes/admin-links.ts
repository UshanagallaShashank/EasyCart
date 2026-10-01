// Platform admin sidebar sections; Stores and Users carry filtered sub-links kept in the URL.
import { LayoutDashboard, Store, Users, TrendingUp, Sprout, UserCog } from 'lucide-react';
import type { NavSection } from '@/components/app-shell/nav-types';

export const ADMIN_SECTIONS: NavSection[] = [
  { title: 'Home', items: [{ to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true }] },
  { title: 'Manage', items: [
    { to: '/admin/stores', label: 'Stores', icon: Store, filterKey: 'status', children: [{ label: 'All stores' }, { label: 'Live', value: 'live' }, { label: 'Not published', value: 'unpublished' }, { label: 'Suspended', value: 'suspended' }, { label: 'Requests', value: 'requests' }] },
    { to: '/admin/users', label: 'Users', icon: Users, filterKey: 'role', children: [{ label: 'All users' }, { label: 'Store owners', value: 'tenant_owner' }, { label: 'Customers', value: 'customer' }, { label: 'Admins', value: 'platform_admin' }] }
  ] },
  { title: 'Insights', items: [
    { to: '/admin/insights/sales', label: 'Sales', icon: TrendingUp },
    { to: '/admin/insights/growth', label: 'Growth', icon: Sprout }
  ] },
  { title: 'Settings', items: [{ to: '/admin/account', label: 'Account & access', icon: UserCog }] }
];
