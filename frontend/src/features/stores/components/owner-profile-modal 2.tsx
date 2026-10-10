// Modal dialog for viewing store owner profile details and account actions.
import { User, Mail, ShieldCheck, Store, Settings, LogOut, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '../hooks/use-own-store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';

interface OwnerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OwnerProfileModal({ open, onOpenChange }: OwnerProfileModalProps) {
  const { user, logout } = useAuth();
  const { data: store } = useOwnStore();
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    onOpenChange(false);
    logout();
    toast.success('Logged out successfully');
  }

  function handleGoToSettings() {
    onOpenChange(false);
    navigate('/dashboard/store');
  }

  const displayName = store?.name || user.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl font-heading font-extrabold text-slate-900">
            Store Owner Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Your store owner account details and configuration
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-start gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-indigo-50/40 to-slate-50 p-4 shadow-xs">
          {store?.logo_url ? (
            <img src={store.logo_url} alt={displayName} className="size-16 shrink-0 rounded-2xl object-cover ring-2 ring-sky-500/20 shadow-md" />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 font-heading font-extrabold text-white text-2xl shadow-md shadow-sky-500/20">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h3 className="font-heading text-base font-bold text-slate-900 truncate">{displayName}</h3>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-100/80 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
              <ShieldCheck className="size-3 text-sky-600" /> Store Owner
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {store?.name && (
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                <Store className="size-4 text-slate-400" /> Store Name
              </span>
              <span className="font-semibold text-slate-900 truncate max-w-[200px]">{store.name}</span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-500">
              <User className="size-4 text-slate-400" /> Owner Username
            </span>
            <span className="font-semibold text-slate-900">{user.username}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-500">
              <Mail className="size-4 text-slate-400" /> Email Address
            </span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px]">{user.email}</span>
          </div>

          {store?.slug && (
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                <Globe className="size-4 text-slate-400" /> Store URL
              </span>
              <span className="font-semibold text-sky-600 truncate max-w-[200px]">/{store.slug}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoToSettings}
            className="h-10 rounded-xl gap-2 font-semibold text-sky-600 border-sky-200 hover:bg-sky-50 cursor-pointer"
          >
            <Settings className="size-4" /> Store Settings
          </Button>
          <LogoutConfirmDialog
            role="owner"
            onConfirm={handleLogout}
            trigger={
              <Button
                type="button"
                className="h-10 rounded-xl gap-2 font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                <LogOut className="size-4 text-white" /> <span className="text-white">Log out</span>
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
