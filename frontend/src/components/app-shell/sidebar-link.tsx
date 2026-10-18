// One top-level sidebar link with icon and the sliding white pill behind the active entry.
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function SidebarLink({ to, label, icon: Icon, active, onNavigate, className }: SidebarLinkProps) {
  return (
    <Link to={to} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={cn('relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors', className, active ? 'font-semibold text-slate-900' : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>
      {active && <motion.span layoutId="nav-active-pill" className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
      <Icon className={cn('relative size-[18px]', active ? 'text-sky-600' : 'text-slate-400')} />
      <span className="relative">{label}</span>
    </Link>
  );
}
