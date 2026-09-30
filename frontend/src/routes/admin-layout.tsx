import { Outlet } from 'react-router-dom';
import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/auth/auth-context';

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-card flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <AppLogo />
          <span className="text-muted-foreground text-sm">Admin</span>
        </div>
        <Button variant="outline" onClick={logout}>Log out</Button>
      </header>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
