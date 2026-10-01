// Storefront page for managing saved delivery addresses in the right-side main area.
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Home,
  Briefcase,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Check,
  Sparkles,
  Phone,
  User,
  Truck,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface SavedAddress {
  id: string;
  label: string;
  recipientName?: string;
  phone?: string;
  street: string;
  cityStateZip?: string;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    label: 'Home',
    recipientName: 'Alex Morgan',
    phone: '+1 (555) 234-5678',
    street: '123 Main Street, Apt 4B',
    cityStateZip: 'Cityville, NY 10001'
  },
  {
    id: '2',
    label: 'Work',
    recipientName: 'Alex Morgan (Office)',
    phone: '+1 (555) 987-6543',
    street: '456 Market Ave, Suite 300',
    cityStateZip: 'New York, NY 10002'
  }
];

export function StorefrontAddressPage() {
  const { slug } = useParams<{ slug: string }>();

  // Load addresses list
  const [addressList, setAddressList] = useState<SavedAddress[]>(() => {
    const raw = localStorage.getItem('customer_saved_addresses');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { /* ignore */ }
    }
    return DEFAULT_ADDRESSES;
  });

  // Selected active address ID
  const [activeAddressId, setActiveAddressId] = useState<string>(() => {
    return localStorage.getItem('customer_active_address_id') || addressList[0]?.id || '1';
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCityStateZip, setNewCityStateZip] = useState('');

  const activeAddress = addressList.find((a) => a.id === activeAddressId) || addressList[0];

  // Sync active address to localStorage for checkout
  useEffect(() => {
    if (activeAddress) {
      const fullAddressStr = [activeAddress.street, activeAddress.cityStateZip].filter(Boolean).join(', ');
      localStorage.setItem('customer_saved_address', fullAddressStr || activeAddress.street);
    }
  }, [activeAddressId, addressList, activeAddress]);

  function handleSelectActive(id: string) {
    setActiveAddressId(id);
    localStorage.setItem('customer_active_address_id', id);
    const sel = addressList.find((a) => a.id === id);
    if (sel) {
      const fullAddressStr = [sel.street, sel.cityStateZip].filter(Boolean).join(', ');
      localStorage.setItem('customer_saved_address', fullAddressStr || sel.street);
      toast.success(`Active delivery address set to "${sel.label}"`);
    }
  }

  function handleAddNewAddress(e: React.FormEvent) {
    e.preventDefault();
    const trimmedStreet = newStreet.trim();
    if (!trimmedStreet) {
      toast.error('Please enter street address');
      return;
    }
    const newAddr: SavedAddress = {
      id: Date.now().toString(),
      label: newLabel.trim() || 'Home',
      recipientName: newRecipient.trim() || undefined,
      phone: newPhone.trim() || undefined,
      street: trimmedStreet,
      cityStateZip: newCityStateZip.trim() || undefined
    };

    const updated = [...addressList, newAddr];
    setAddressList(updated);
    localStorage.setItem('customer_saved_addresses', JSON.stringify(updated));
    handleSelectActive(newAddr.id);
    setNewStreet('');
    setNewRecipient('');
    setNewPhone('');
    setNewCityStateZip('');
    setShowAddForm(false);
    toast.success('New delivery address added & activated!');
  }

  function handleDeleteAddress(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (addressList.length <= 1) {
      toast.error('You must keep at least one saved delivery address');
      return;
    }
    const updated = addressList.filter((a) => a.id !== id);
    setAddressList(updated);
    localStorage.setItem('customer_saved_addresses', JSON.stringify(updated));
    if (activeAddressId === id) {
      handleSelectActive(updated[0].id);
    }
    toast.success('Address removed');
  }

  function getLabelIcon(label: string) {
    switch (label.toLowerCase()) {
      case 'home':
        return <Home className="size-4" />;
      case 'work':
      case 'office':
        return <Briefcase className="size-4" />;
      default:
        return <Building2 className="size-4" />;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link
          to={`/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors bg-white/80 hover:bg-white border border-slate-200/60 rounded-full px-3.5 py-1.5 shadow-2xs"
        >
          <ArrowLeft className="size-3.5" /> Back to shop
        </Link>
      </div>

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 mb-8">
        <div className="absolute -right-10 -top-10 size-56 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 size-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-sky-300 backdrop-blur-md border border-white/10 mb-3">
              <Sparkles className="size-3.5 text-[#F58220]" />
              <span>Customer Preferences</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Delivery Addresses
            </h1>
            <p className="mt-1.5 text-xs font-medium text-slate-300 sm:text-sm max-w-xl">
              Manage saved locations for instant 1-click checkout and seamless order fulfillment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right border-r border-white/10 pr-4">
              <span className="text-2xl font-black text-white">{addressList.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">Saved Locations</span>
            </div>
            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="h-12 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 font-bold text-slate-950 hover:from-sky-300 hover:to-sky-400 transition-all shadow-lg shadow-sky-500/25 px-5 cursor-pointer gap-2 text-xs border border-sky-300/40"
            >
              <Plus className="size-4" /> Add New Address
            </Button>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 items-start">
        {/* Left Column: Saved Addresses List */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Addresses ({addressList.length})
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Click card to set default</span>
          </div>

          <div className="space-y-3.5">
            {addressList.map((addr) => {
              const selected = addr.id === activeAddressId;
              const fullAddress = [addr.street, addr.cityStateZip].filter(Boolean).join(', ');

              return (
                <motion.div
                  key={addr.id}
                  whileHover={{ y: -2 }}
                  onClick={() => handleSelectActive(addr.id)}
                  className={`group relative rounded-3xl border p-5 transition-all cursor-pointer ${
                    selected
                      ? 'border-sky-500 bg-white shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Icon & Details */}
                    <div className="flex items-start gap-3.5">
                      {/* Address Type Icon Badge */}
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
                          selected
                            ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-600'
                        }`}
                      >
                        {getLabelIcon(addr.label)}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-base font-extrabold text-slate-900">
                            {addr.label}
                          </span>
                          {selected ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200/60">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active Address
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-sky-600 transition-colors">
                              Click to select
                            </span>
                          )}
                        </div>

                        {/* Recipient & Contact info */}
                        {(addr.recipientName || addr.phone) && (
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                            {addr.recipientName && (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <User className="size-3 text-slate-400" />
                                {addr.recipientName}
                              </span>
                            )}
                            {addr.phone && (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Phone className="size-3 text-slate-400" />
                                {addr.phone}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Full Address Text */}
                        <div className="mt-2 flex items-start gap-1.5 text-xs font-medium text-slate-600 leading-relaxed">
                          <MapPin className="size-3.5 shrink-0 text-sky-500 mt-0.5" />
                          <span>{fullAddress || addr.street}</span>
                        </div>
                      </div>
                    </div>

                    {/* Checkmark & Delete Actions */}
                    <div className="flex items-center gap-2">
                      {selected ? (
                        <div className="flex size-7 items-center justify-center rounded-full bg-sky-600 text-white shadow-xs">
                          <Check className="size-4 stroke-[3]" />
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectActive(addr.id);
                          }}
                          className="h-8 rounded-full text-xs font-bold text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                        >
                          Use This
                        </Button>
                      )}

                      {addressList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-2 cursor-pointer rounded-xl hover:bg-rose-50"
                          title="Delete Address"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Add Address Form or Active Summary Widget */}
        <div className="md:col-span-5 sticky top-20">
          <AnimatePresence mode="wait">
            {showAddForm ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-sky-200/80 bg-gradient-to-b from-white to-sky-50/30 p-6 shadow-xl shadow-sky-900/5 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <Plus className="size-4" />
                    </div>
                    <h3 className="font-heading text-base font-extrabold text-slate-900">Add New Address</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="size-4.5" />
                  </button>
                </div>

                <form onSubmit={handleAddNewAddress} className="space-y-4">
                  {/* Address Type Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Address Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Home', icon: Home },
                        { label: 'Work', icon: Briefcase },
                        { label: 'Other', icon: Building2 }
                      ].map(({ label, icon: Icon }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setNewLabel(label)}
                          className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
                            newLabel === label
                              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="size-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                      <Input
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="h-10 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                      <Input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="h-10 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="123 Main St, Apt / Suite number"
                      className="h-10 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                    />
                  </div>

                  {/* City, State & Zip */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City, State & Postal Code</label>
                    <Input
                      value={newCityStateZip}
                      onChange={(e) => setNewCityStateZip(e.target.value)}
                      placeholder="e.g. Cityville, NY 10001"
                      className="h-10 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="w-1/3 h-11 rounded-2xl text-xs font-bold border-slate-200 hover:bg-slate-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-2/3 h-11 rounded-2xl font-bold bg-sky-600 text-white hover:bg-sky-700 gap-2 shadow-md shadow-sky-600/20 cursor-pointer text-xs"
                    >
                      <CheckCircle2 className="size-4" /> Save & Activate
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
              >
                {/* Delivery Guarantee Badge */}
                <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-sky-900">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Default Express Shipping</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Orders deliver in 2-3 business days to your active location.
                    </p>
                  </div>
                </div>

                {/* Active Delivery Summary */}
                {activeAddress && (
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400 uppercase tracking-wider">Active Destination</span>
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                        {activeAddress.label}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5">
                      <p className="text-xs font-bold text-slate-900">
                        {activeAddress.recipientName || 'Valued Customer'}
                      </p>
                      <p className="mt-1 text-xs text-slate-600 font-medium leading-relaxed">
                        {[activeAddress.street, activeAddress.cityStateZip].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full h-11 rounded-2xl border-dashed border-sky-300 text-sky-600 font-bold bg-sky-50/40 hover:bg-sky-50 transition-all gap-2 text-xs cursor-pointer shadow-2xs"
                  >
                    <Plus className="size-4" /> Add Another Location
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 font-medium">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> Safe & encrypted address storage
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

