// Platform admin sidebar, using the same shared sidebar as the store owner dashboard.
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { ADMIN_SECTIONS } from './admin-links';

export function AdminNavContent({ onNavigate }: { onNavigate?: () => void }) {
  return <AppSidebar title="Platform admin" homeTo="/admin" sections={ADMIN_SECTIONS} ariaLabel="Admin" onNavigate={onNavigate} />;
}
