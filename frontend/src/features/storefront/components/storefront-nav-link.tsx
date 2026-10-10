// Header navigation link with an icon, active-route highlight, and a label hidden on phones.
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorefrontNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  children?: ReactNode;
}

export function StorefrontNavLink({ to, icon: Icon, label, end, children }: StorefrontNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) => cn(
        'relative flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors',
        isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon className="size-[18px]" />
      <span className="hidden md:inline">{label}</span>
      {children}
    </NavLink>
  );
}
