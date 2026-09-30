// Merchant dashboard layout with fixed header, fixed sidebar, and scrollable content
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardHeader } from './dashboard-header';
import { DashboardNav } from './dashboard-nav';

export function DashboardLayout() {
  const { pathname } = useLocation();

  return (
    <div className="h-svh w-screen flex flex-col overflow-hidden bg-[#F8FAFC]">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardNav />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div key={pathname} className="flex-1 flex flex-col overflow-hidden animate-content-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
