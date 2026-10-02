// Store owner profile dropdown menu in top bar matching customer dropdown style.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Store, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';
import { useOwnStore } from '@/features/stores/hooks/use-own-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';

export function DashboardUserMenu() {
  const { user, logout } = useAuth();
  const { data: store } = useOwnStore();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = store?.name || user?.username || 'Store';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        role={user?.role === 'platform_admin' ? 'admin' : 'owner'}
        onConfirm={logout}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="User menu"
            className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 py-1 pl-1.5 pr-2.5 text-xs font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50/60 hover:text-sky-700 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {store?.logo_url ? (
              <img src={store.logo_url} alt={displayName} className="size-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200" />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700 text-xs">
                {initial}
              </span>
            )}
            <span className="hidden sm:inline max-w-[140px] truncate text-xs font-semibold text-slate-900">
              {displayName}
            </span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-2xl p-1.5 shadow-lg border border-slate-200/80 z-50">
          <div className="px-3 py-2.5">
            <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
          </div>

          <DropdownMenuSeparator className="my-1 border-slate-100" />

          {store?.slug && (
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 py-2.5 px-3 font-medium text-slate-700 rounded-xl"
              onSelect={() => window.open(`/${store.slug}`, '_blank')}
            >
              <Store className="size-4 text-sky-500" />
              <span>View live store</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 py-2.5 px-3 font-medium text-slate-700 rounded-xl"
            onSelect={() => navigate('/dashboard/store')}
          >
            <Settings className="size-4 text-slate-500" />
            <span>Store settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 border-slate-100" />

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 py-2.5 px-3 font-medium text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-xl"
            onSelect={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="size-4 text-rose-500" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
