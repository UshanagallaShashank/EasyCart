// Signed-in admin's avatar menu in the top bar: name, email, account page, and log out.
import { Link } from 'react-router-dom';
import { LogOut, UserCog, ChevronDown } from 'lucide-react';
import { useAuth } from '@/shared/auth/auth-context';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function AdminUserMenu() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 outline-none hover:bg-slate-100 focus-visible:ring-3 focus-visible:ring-sky-500/30" aria-label="Account menu">
        <span className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">{user?.username?.charAt(0).toUpperCase() ?? 'A'}</span>
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 xl:inline">{user?.username}</span>
        <ChevronDown className="size-3.5 text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2.5 py-2"><span className="block truncate text-sm font-semibold text-slate-900">{user?.username}</span><span className="block truncate text-xs font-normal text-slate-500">{user?.email}</span></DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2"><Link to="/admin/account"><UserCog /> Account & access</Link></DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={logout} className="rounded-lg px-2.5 py-2"><LogOut /> Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
