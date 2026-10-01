// Left navigation sidebar pane for customer storefront pages.
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Package, PackageCheck, MapPin, Edit3, Store as StoreIcon } from 'lucide-react';
import type { PublicStore } from '../types/storefront-types';

export interface SavedAddress {
  id: string;
  label: string;
  street: string;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  { id: '1', label: 'Home', street: '123 Main St, Cityville, NY 10001' },
  { id: '2', label: 'Work', street: '456 Market Ave, Suite 300, NY 10002' }
];

interface StorefrontSidebarProps {
  store: PublicStore;
  slug: string;
  onNavigate?: () => void;
}

export function StorefrontSidebar({ store, slug, onNavigate }: StorefrontSidebarProps) {
  const { pathname } = useLocation();

  // Load addresses list
  const [addressList] = useState<SavedAddress[]>(() => {
    const raw = localStorage.getItem('customer_saved_addresses');
    if (raw) {
      try { return JSON.parse(raw); } catch { /* ignore */ }
    }
    return DEFAULT_ADDRESSES;
  });

  // Selected active address ID
  const [activeAddressId] = useState<string>(() => {
    return localStorage.getItem('customer_active_address_id') || '1';
  });

  const activeAddress = addressList.find((a) => a.id === activeAddressId) || addressList[0] || {
    id: '1',
    label: 'Home',
    street: '123 Main St, Cityville, NY 10001'
  };

  // Sync active address street to localStorage for checkout
  useEffect(() => {
    if (activeAddress?.street) {
      localStorage.setItem('customer_saved_address', activeAddress.street);
    }
  }, [activeAddress]);

  const homePath = `/${slug}`;
  const productsPath = `/${slug}/products`;
  const ordersPath = `/${slug}/orders`;
  const addressPath = `/${slug}/address`;

  const links = [
    { to: homePath, label: 'Home', icon: Home, exact: true },
    { to: productsPath, label: 'Products', icon: Package },
    { to: ordersPath, label: 'My Orders', icon: PackageCheck },
    { to: addressPath, label: 'Address', icon: MapPin }
  ];

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200/80 bg-white/95 backdrop-blur-md hidden md:flex flex-col p-4 shadow-xs justify-between">
      <div className="flex flex-col gap-4">
        {/* Nav Links */}
        <nav className="space-y-1.5">
          {links.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === to : pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                onClick={onNavigate}
                className={`group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-sky-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="storefront-sidebar-active"
                    className="absolute inset-0 rounded-xl bg-sky-50 border border-sky-200/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className={`size-4.5 transition-transform duration-200 ${isActive ? 'text-sky-600 scale-110' : 'text-slate-400 group-hover:scale-105 group-hover:text-sky-600'}`} />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Address Card & Footer */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Saved Delivery Address Card */}
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/70 to-indigo-50/20 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <MapPin className="size-3.5 text-sky-500" /> Delivery Address
            </div>
            <Link
              to={addressPath}
              onClick={onNavigate}
              className="text-[11px] font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Edit3 className="size-3" /> Change
            </Link>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
              {activeAddress.label}
            </span>
          </div>
          <p className="line-clamp-2 text-xs text-slate-600 font-medium leading-relaxed">
            {activeAddress.street}
          </p>
        </div>

        {/* Store Info Footer */}
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
          <StoreIcon className="mx-auto size-4 text-slate-400 mb-1" />
          <p className="font-medium text-slate-700">{store.name}</p>
          <p className="text-[10px] text-slate-400">Powered by EasyCart</p>
        </div>
      </div>
    </aside>
  );
}

