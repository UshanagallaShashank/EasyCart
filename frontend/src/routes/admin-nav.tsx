// Section tabs for the platform admin console (Overview, Stores, Users); scrolls sideways on phones.
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const ADMIN_SECTIONS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/stores', label: 'Stores', icon: Store, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false }
];

export function AdminNav() {
  return (
    <nav aria-label="Admin sections" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:px-8">
      {ADMIN_SECTIONS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors', isActive ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900')}>
          <Icon className="size-4" /> {label}
        </NavLink>
      ))}
    </nav>
  );
}
