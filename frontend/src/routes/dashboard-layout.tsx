// Merchant dashboard layout with fixed header, fixed sidebar, and animated content
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
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div key={pathname} className="max-w-7xl mx-auto w-full animate-content-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
