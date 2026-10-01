// Sidebar for the merchant dashboard. The same content is used in the desktop rail and the mobile drawer.
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { DASHBOARD_SECTIONS } from './dashboard-links';

export function DashboardNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: store } = useOwnStore();
  return <AppSidebar title={store?.name ?? 'Store dashboard'} homeTo="/dashboard/overview" sections={DASHBOARD_SECTIONS} ariaLabel="Dashboard" onNavigate={onNavigate} />;
}

export function DashboardNav() {
  return (
    <aside className="hidden h-full w-64 shrink-0 lg:block">
      <DashboardNavContent />
    </aside>
  );
}
