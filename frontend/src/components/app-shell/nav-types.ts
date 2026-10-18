// Shapes for sidebar navigation: sections of items, where an item may hold filtered sub-links.
import type { LucideIcon } from 'lucide-react';

export interface NavChild {
  label: string;
  value?: string;
}

export interface NavItemDef {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  filterKey?: string;
  children?: NavChild[];
}

export interface NavSection {
  title: string;
  items: NavItemDef[];
}
