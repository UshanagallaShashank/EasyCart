// Decides which sidebar item or sub-link matches the current URL, and builds sub-link targets.
import type { Location } from 'react-router-dom';
import type { NavChild, NavItemDef, NavSection } from './nav-types';

export function is_item_active(item: NavItemDef, pathname: string): boolean {
  return item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function child_target(item: NavItemDef, child: NavChild): string {
  return child.value && item.filterKey ? `${item.to}?${item.filterKey}=${child.value}` : item.to;
}

export function is_child_active(item: NavItemDef, child: NavChild, location: Location): boolean {
  if (location.pathname !== item.to || !item.filterKey) return false;
  return (new URLSearchParams(location.search).get(item.filterKey) ?? undefined) === child.value;
}

export function find_nav_title(sections: NavSection[], location: Location): string | undefined {
  const item = sections.flatMap((s) => s.items).find((i) => is_item_active(i, location.pathname));
  const child = item?.children?.find((c) => c.value && is_child_active(item, c, location));
  return item && child ? `${item.label} · ${child.label}` : item?.label;
}
