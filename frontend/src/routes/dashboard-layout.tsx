import { Link, Outlet, useLocation } from 'react-router-dom';
import { Store, Tags, Package, ClipboardList, Users, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { NotificationBell } from '@/features/notifications/components/notification-bell';

const NAV_LINKS = [
  { to: '/dashboard/store', label: 'Store', icon: Store },
  { to: '/dashboard/categories', label: 'Categories', icon: Tags },
  { to: '/dashboard/products', label: 'Products', icon: Package },
  { to: '/dashboard/orders', label: 'Orders', icon: ClipboardList },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/coupons', label: 'Coupons', icon: Ticket }
];

export function DashboardLayout() {
  const { logout } = useAuth();
  const { data: store } = useOwnStore();
  const location = useLocation();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-card flex items-center justify-between border-b px-6 py-4">
        <span className="font-heading text-lg">{store?.name ?? 'EasyCart'}</span>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Button variant="outline" onClick={logout}>Log out</Button>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="w-48 border-r p-4">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.to);
              const Icon = link.icon;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive ? 'bg-secondary text-secondary-foreground font-medium' : 'hover:bg-secondary/30'
                    }`}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
