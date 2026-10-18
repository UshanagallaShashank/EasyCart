// Modal dialog allowing platform admins to manage user status (active/inactive) and roles. User personal details are read-only.
import { useState, useEffect } from 'react';
import { Phone, ShieldCheck, Store, ShoppingBag, AlertTriangle, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CustomerAvatar } from '@/features/tenant-customers/components/customer-avatar';
import { UserStatusBadge } from './user-status-badge';
import { useUpdatePlatformUser } from '../hooks/use-platform-users';
import type { PlatformUser, PlatformRole, UserStatus } from '../types/admin-types';

interface UserEditModalProps {
  user: PlatformUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLES: { id: PlatformRole; label: string; desc: string; icon: any; color: string }[] = [
  {
    id: 'customer',
    label: 'Customer',
    desc: 'Browses storefronts, places orders, and manages customer profile.',
    icon: ShoppingBag,
    color: 'border-violet-200 bg-violet-50/50 text-violet-700'
  },
  {
    id: 'tenant_owner',
    label: 'Store Owner',
    desc: 'Owns and manages an individual store, products, orders, and coupons.',
    icon: Store,
    color: 'border-sky-200 bg-sky-50/50 text-sky-700'
  },
  {
    id: 'platform_admin',
    label: 'Platform Admin',
    desc: 'Full administrative access across all stores, users, insights, and settings.',
    icon: ShieldCheck,
    color: 'border-slate-300 bg-slate-100 text-slate-800'
  }
];

function formatDateTime(isoDate?: string | null): string {
  if (!isoDate) return 'Never';
  return new Date(isoDate).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function UserEditModal({ user, open, onOpenChange }: UserEditModalProps) {
  const updateMutation = useUpdatePlatformUser();

  const [role, setRole] = useState<PlatformRole>('customer');
  const [status, setStatus] = useState<UserStatus>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role || 'customer');
      setStatus(user.status || 'active');
      setError(null);
    }
  }, [user, open]);

  if (!user) return null;

  const isRoleChanged = role !== user.role;
  const isStatusChanged = status !== (user.status || 'active');
  const isDirty = isRoleChanged || isStatusChanged;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        updates: {
          role,
          status
        }
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to update user status and role');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
            Manage User Status & Role
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Configure access status and platform role for {user.username}.
          </DialogDescription>
        </DialogHeader>

        {/* Read-only User Information Card */}
        <div className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <CustomerAvatar id={user.id} name={user.username} className="size-12 text-base" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-base font-bold text-slate-900">{user.username}</span>
                <UserStatusBadge status={user.status} />
              </div>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-3 text-xs">
            <div>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Phone className="size-3 text-slate-400" /> Phone
              </span>
              <p className="mt-0.5 font-medium text-slate-700">
                {user.phone_number && user.phone_number !== 'undefined' ? user.phone_number : '—'}
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="size-3 text-slate-400" /> Last usage
              </span>
              <p className="mt-0.5 font-medium text-slate-700">
                {formatDateTime(user.last_active_at || user.created_at)}
              </p>
            </div>
          </div>

          <p className="mt-2.5 text-[11px] text-slate-400 italic">
            Note: Personal user details (name, email, phone) can only be modified by the user.
          </p>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertTriangle className="size-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Account Status Control (Active vs Inactive) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Account Status</span>
              <span className="text-[11px] font-normal text-slate-400">Toggle user system access</span>
            </Label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                  status === 'active'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                    status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Active</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Account is enabled. Can log in and use EasyCart.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus('inactive')}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                  status === 'inactive'
                    ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                    status === 'inactive' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <XCircle className="size-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Inactive</span>
                  <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                    Account deactivated. User is blocked from logging in.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-slate-400" /> Platform Role & Access Level
              </span>
            </Label>

            <div className="grid gap-2">
              {ROLES.map((r) => {
                const isSelected = role === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-xl border ${r.color}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-sm font-bold text-slate-900">{r.label}</span>
                        {isSelected && (
                          <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {isRoleChanged && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Role modification warning</p>
                  <p className="mt-0.5 text-amber-700">
                    Changing role from <strong>{user.role}</strong> to <strong>{role}</strong>.
                    {role === 'customer' && ' Store owner privileges will be revoked.'}
                    {role === 'platform_admin' && ' Grants complete administrative control.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="rounded-xl gap-2 font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-xs cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
