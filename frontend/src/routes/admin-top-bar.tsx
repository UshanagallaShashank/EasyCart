// Platform admin top bar: brand, dropdown menus (desktop) or menu button (phones), and the account menu.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { ADMIN_MENUS } from './admin-menu';
import { AdminMenuDropdown } from './admin-menu-dropdown';
import { AdminUserMenu } from './admin-user-menu';
import { AdminMobileMenu } from './admin-mobile-menu';

export function AdminTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="safe-top z-30 shrink-0 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="size-5" /></button>
        <Link to="/admin" className="flex shrink-0 items-center gap-2.5">
          <img src="/easy-cart-icon.png" alt="EasyCart" className="h-9 w-auto" />
          <span className="hidden items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 sm:inline-flex"><ShieldCheck className="size-3.5" /> Admin</span>
        </Link>
        <nav aria-label="Admin" className="hidden flex-1 items-center gap-1 lg:flex">{ADMIN_MENUS.map((menu) => <AdminMenuDropdown key={menu.label} menu={menu} />)}</nav>
        <div className="ml-auto"><AdminUserMenu /></div>
      </div>
      <AdminMobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
