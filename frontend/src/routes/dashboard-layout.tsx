// Merchant dashboard layout: full-height sidebar on the left, top bar and scrollable page on the right.
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoading } from '@/components/page-loading';
import { DashboardHeader } from './dashboard-header';
import { DashboardNav } from './dashboard-nav';
import { useLiveUpdates } from '@/shared/live/use-live-updates';

export function DashboardLayout() {
  useLiveUpdates('owner');
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <DashboardNav />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden"><Suspense fallback={<PageLoading />}><Outlet /></Suspense></main>
      </div>
    </div>
  );
}
