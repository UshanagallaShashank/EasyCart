// Platform admin top-navigation menus, their dropdown entries, and URL matching for the active state.
import { LayoutDashboard, Store, Users, LineChart, type LucideIcon } from 'lucide-react';

export interface AdminMenuEntry {
  label: string;
  to: string;
  hint: string;
}

export interface AdminMenu {
  label: string;
  icon: LucideIcon;
  to?: string;
  entries?: AdminMenuEntry[];
}

export const ADMIN_MENUS: AdminMenu[] = [
  { label: 'Overview', icon: LayoutDashboard, to: '/admin' },
  { label: 'Stores', icon: Store, entries: [
    { label: 'All stores', to: '/admin/stores', hint: 'Every store on EasyCart' },
    { label: 'Live', to: '/admin/stores?status=live', hint: 'Active and published' },
    { label: 'Not published', to: '/admin/stores?status=unpublished', hint: 'Set up but not visible yet' },
    { label: 'Suspended', to: '/admin/stores?status=suspended', hint: 'Taken offline by an admin' }
  ] },
  { label: 'Users', icon: Users, entries: [
    { label: 'All users', to: '/admin/users', hint: 'Every account' },
    { label: 'Store owners', to: '/admin/users?role=tenant_owner', hint: 'People running a store' },
    { label: 'Customers', to: '/admin/users?role=customer', hint: 'Shopper accounts' },
    { label: 'Admins', to: '/admin/users?role=platform_admin', hint: 'Platform administrators' }
  ] },
  { label: 'Insights', icon: LineChart, entries: [
    { label: 'Sales', to: '/admin/insights/sales', hint: 'Revenue, top stores, weekdays' },
    { label: 'Growth', to: '/admin/insights/growth', hint: 'New stores, funnel, users' }
  ] }
];

export function is_entry_active(to: string, pathname: string, search: string): boolean {
  const target = new URL(to, 'http://x');
  if (target.pathname !== pathname) return false;
  const here = new URLSearchParams(search);
  return ['status', 'role'].every((key) => (here.get(key) ?? '') === (target.searchParams.get(key) ?? ''));
}

export function is_menu_active(menu: AdminMenu, pathname: string): boolean {
  if (menu.to) return pathname === menu.to;
  return Boolean(menu.entries?.some((e) => pathname === new URL(e.to, 'http://x').pathname || pathname.startsWith(`${new URL(e.to, 'http://x').pathname}/`)));
}
