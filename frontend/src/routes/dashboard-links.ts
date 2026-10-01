// Merchant dashboard navigation entries, grouped into the sections shown in the sidebar.
import { LayoutDashboard, Store, Tags, Package, ClipboardList, Users, Ticket, type LucideIcon } from 'lucide-react';

export interface DashboardLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const DASHBOARD_SECTIONS: { title: string; links: DashboardLink[] }[] = [
  { title: 'Home', links: [{ to: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard }] },
  { title: 'Sales', links: [
    { to: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
    { to: '/dashboard/customers', label: 'Customers', icon: Users },
    { to: '/dashboard/coupons', label: 'Coupons', icon: Ticket }
  ] },
  { title: 'Catalog', links: [
    { to: '/dashboard/products', label: 'Products', icon: Package },
    { to: '/dashboard/categories', label: 'Categories', icon: Tags }
  ] },
  { title: 'Settings', links: [{ to: '/dashboard/store', label: 'Store settings', icon: Store }] }
];

export function find_dashboard_link(pathname: string): DashboardLink | undefined {
  return DASHBOARD_SECTIONS.flatMap((s) => s.links).find((l) => pathname.startsWith(l.to));
}
