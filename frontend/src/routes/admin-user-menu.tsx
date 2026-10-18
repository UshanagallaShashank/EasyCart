// Admin profile chip in the top bar (avatar, name, email) with a menu for the account page.
import { Link } from 'react-router-dom';
import { UserCog, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function AdminUserMenu() {
  const { user } = useAuth();
  const initial = user?.username?.charAt(0).toUpperCase() ?? 'A';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pr-2 pl-1 outline-none hover:bg-slate-100 focus-visible:ring-3 focus-visible:ring-sky-500/30" aria-label="Profile menu">
        <span className="flex size-9 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">{initial}</span>
        <span className="hidden text-left leading-tight md:block"><span className="block max-w-40 truncate text-sm font-semibold text-slate-900">{user?.username}</span><span className="block max-w-40 truncate text-xs text-slate-500">{user?.email}</span></span>
        <ChevronDown className="size-4 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-xl p-1.5">
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-bold text-sky-700">{initial}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{user?.username}</span><span className="flex items-center gap-1 text-xs font-normal text-sky-700"><ShieldCheck className="size-3.5" /> Platform admin</span></span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2"><Link to="/admin/account"><UserCog /> Account & access</Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
