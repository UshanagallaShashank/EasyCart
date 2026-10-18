// Pill displaying user active / inactive status with clean badge colors.
import { cn } from '@/lib/utils';
import type { UserStatus } from '../types/admin-types';

export function UserStatusBadge({ status = 'active' }: { status?: UserStatus }) {
  const isActive = status === 'active';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          isActive ? 'bg-emerald-500' : 'bg-rose-500'
        )}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
