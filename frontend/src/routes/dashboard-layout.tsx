import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';

const NAV_LINKS = [
  { to: '/dashboard/store', label: 'Store' },
  { to: '/dashboard/categories', label: 'Categories' },
  { to: '/dashboard/products', label: 'Products' },
  { to: '/dashboard/orders', label: 'Orders' }
];

export function DashboardLayout() {
  const { logout } = useAuth();
  const { data: store } = useOwnStore();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-medium">{store?.name ?? 'EasyCart'}</span>
        <Button variant="outline" onClick={logout}>Log out</Button>
      </header>
      <div className="flex flex-1">
        <nav className="w-48 border-r p-4">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:underline">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
