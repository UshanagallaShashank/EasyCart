// Modal displaying detailed user profile, associated store, last usage, and account activity for platform admins.
import { Link } from 'react-router-dom';
import { Mail, Phone, Calendar, Store, ShieldCheck, User, Package, Clock, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerAvatar } from '@/features/tenant-customers/components/customer-avatar';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';
import { CopyButton } from './copy-button';
import { formatOrderDate, formatMoney, shortOrderId } from '@/features/orders/lib/order-rules';
import { usePlatformUser } from '../hooks/use-platform-users';
import type { PlatformUser } from '../types/admin-types';

interface UserDetailModalProps {
  user: PlatformUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: PlatformUser) => void;
}

function formatExactDateTime(isoDate?: string | null): string {
  if (!isoDate) return 'Never';
  return new Date(isoDate).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function UserDetailModal({ user, open, onOpenChange, onEdit }: UserDetailModalProps) {
  const { data: detail, isLoading } = usePlatformUser(open && user ? user.id : null);
  const activeUser = detail ?? user;

  if (!activeUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
            User Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Platform account details, role permissions, and activity summary
          </DialogDescription>
        </DialogHeader>

        {/* Profile Card Header */}
        <div className="mt-3 flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-50 p-4">
          <CustomerAvatar id={activeUser.id} name={activeUser.username} className="size-14 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-heading text-lg font-bold text-slate-900">
                {activeUser.username}
              </h3>
              <UserRoleBadge role={activeUser.role} />
              <UserStatusBadge status={activeUser.status} />
            </div>
            <p className="truncate text-xs text-slate-500">{activeUser.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                <span>Joined {formatOrderDate(activeUser.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400" />
                <span>Last active: {formatExactDateTime(activeUser.last_active_at || activeUser.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <User className="size-3.5 text-slate-400" /> Username
            </span>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{activeUser.username}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Mail className="size-3.5 text-slate-400" /> Email address
            </span>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900" title={activeUser.email}>
              {activeUser.email}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Phone className="size-3.5 text-slate-400" /> Phone number
            </span>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
              {activeUser.phone_number && activeUser.phone_number !== 'undefined'
                ? activeUser.phone_number
                : <span className="text-slate-400 font-normal italic">Not provided</span>}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock className="size-3.5 text-slate-400" /> Last usage
            </span>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">
              {formatExactDateTime(activeUser.last_active_at || activeUser.created_at)}
            </p>
          </div>
        </div>

        {/* User ID copy */}
        <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-100/70 px-3.5 py-2 text-xs">
          <span className="font-mono text-slate-500">ID: {activeUser.id}</span>
          <CopyButton text={activeUser.id} label="Copy ID" />
        </div>

        {/* Associated Store */}
        {activeUser.store && (
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider">
                <Store className="size-4 text-sky-600" /> Associated Store
              </span>
              <Link
                to={`/admin/stores/${activeUser.store.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
              >
                View store <ExternalLink className="size-3" />
              </Link>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{activeUser.store.name}</p>
                <p className="text-xs text-slate-500 font-mono">/{activeUser.store.slug}</p>
              </div>
              {activeUser.store.status && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold border border-slate-200 capitalize">
                  {activeUser.store.status}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Activity & Orders Summary */}
        {isLoading ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : detail && ((detail.orders_count !== undefined && detail.orders_count > 0) || (detail.recent_orders && detail.recent_orders.length > 0)) ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                <Package className="size-3.5 text-slate-400" />
                {detail.role === 'tenant_owner' ? 'Store Orders' : 'Recent Orders'}
              </h4>
              <span className="text-xs text-slate-500">
                Total: <strong className="text-slate-800">{detail.orders_count ?? 0} orders</strong> ({formatMoney(detail.total_spent ?? 0)})
              </span>
            </div>

            {detail.recent_orders && detail.recent_orders.length > 0 && (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white">
                {detail.recent_orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{shortOrderId(o.id)}</p>
                      <p className="text-[11px] text-slate-400">{formatOrderDate(o.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatMoney(o.total)}</p>
                      <span className="text-[10px] uppercase font-bold text-slate-500">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onEdit(activeUser);
            }}
            className="rounded-xl gap-2 font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-xs cursor-pointer"
          >
            <ShieldCheck className="size-4" /> Change Role & Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
