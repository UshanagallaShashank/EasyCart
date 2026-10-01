// Pill naming a user's platform role, with a distinct color per role.
import { cn } from '@/lib/utils';
import type { PlatformRole } from '../types/admin-types';

const ROLE_STYLES: Record<PlatformRole, { label: string; className: string }> = {
  tenant_owner: { label: 'Store owner', className: 'bg-sky-50 text-sky-700' },
  customer: { label: 'Customer', className: 'bg-violet-50 text-violet-700' },
  platform_admin: { label: 'Admin', className: 'bg-slate-900 text-white' }
};

export function UserRoleBadge({ role }: { role: PlatformRole }) {
  const style = ROLE_STYLES[role] ?? { label: role, className: 'bg-slate-100 text-slate-600' };
  return <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap', style.className)}>{style.label}</span>;
}
