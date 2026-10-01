// Merchant dashboard navigation entries, grouped into the sections shown in the sidebar.
import { LayoutDashboard, Store, Tags, Package, ClipboardList, Users, Ticket } from 'lucide-react';
import type { NavSection } from '@/components/app-shell/nav-types';

export const DASHBOARD_SECTIONS: NavSection[] = [
  { title: 'Home', items: [{ to: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard }] },
  { title: 'Sales', items: [
    { to: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { to: '/dashboard/customers', label: 'Customers', icon: Users },
    { to: '/dashboard/coupons', label: 'Coupons', icon: Ticket }
  ] },
  { title: 'Catalog', items: [
    { to: '/dashboard/products', label: 'Products', icon: Package },
    { to: '/dashboard/categories', label: 'Categories', icon: Tags }
  ] },
  { title: 'Settings', items: [{ to: '/dashboard/store', label: 'Store settings', icon: Store }] }
];
