// Storefront page for managing saved delivery addresses in the right-side main area.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Home,
  Briefcase,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  Sparkles,
  Phone,
  User,
  Truck,
  ShieldCheck,
  X,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { MapPinPicker } from '../components/map-pin-picker';
import type { Point } from '@/features/delivery/lib/use-current-position';

export interface SavedAddress {
  id: string;
  label: string;
  recipientName?: string;
  phone?: string;
  street: string;
  landmark?: string;
  city?: string;
  state?: string;
  zip?: string;
  cityStateZip?: string;
  /** The pin dropped on the map for this address (optional). */
  latitude?: number;
  longitude?: number;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: '1',
    label: 'Home',
    recipientName: 'Alex Morgan',
    phone: '+1 (555) 234-5678',
    street: '123 Main Street, Apt 4B',
    city: 'Cityville',
    state: 'NY',
    zip: '10001',
    cityStateZip: 'Cityville, NY 10001'
  },
  {
    id: '2',
    label: 'Work',
    recipientName: 'Alex Morgan (Office)',
    phone: '+1 (555) 987-6543',
    street: '456 Market Ave, Suite 300',
    landmark: 'Near City Mall',
    city: 'Hyderabad',
    state: 'Telangana',
    zip: '500001',
    cityStateZip: 'Hyderabad, Telangana 500001'
  }
];

export function StorefrontAddressPage() {
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
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('Home');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPinCode, setNewPinCode] = useState('');
  const [newPoint, setNewPoint] = useState<Point | null>(null);

  // Confirmation dialog states
  const [selectConfirmAddress, setSelectConfirmAddress] = useState<SavedAddress | null>(null);
  const [deleteConfirmAddress, setDeleteConfirmAddress] = useState<SavedAddress | null>(null);

  const activeAddress = addressList.find((a) => a.id === activeAddressId) || addressList[0];

  // Sync active address to localStorage for checkout
  useEffect(() => {
    if (activeAddress) {
      const parts = [
        activeAddress.street,
        activeAddress.landmark ? `(Near ${activeAddress.landmark.replace(/^near\s+/i, '')})` : undefined,
        activeAddress.cityStateZip || [activeAddress.city, activeAddress.state, activeAddress.zip].filter(Boolean).join(', ')
      ].filter(Boolean);
      localStorage.setItem('customer_saved_address', parts.join(', '));
    }
  }, [activeAddressId, addressList, activeAddress]);

  function handleSelectActive(id: string) {
    setActiveAddressId(id);
    localStorage.setItem('customer_active_address_id', id);
    const sel = addressList.find((a) => a.id === id);
    if (sel) {
      const parts = [
        sel.street,
        sel.landmark ? `(Near ${sel.landmark.replace(/^near\s+/i, '')})` : undefined,
        sel.cityStateZip || [sel.city, sel.state, sel.zip].filter(Boolean).join(', ')
      ].filter(Boolean);
      localStorage.setItem('customer_saved_address', parts.join(', '));
      toast.success(`Active delivery address set to "${sel.label}"`);
    }
    window.dispatchEvent(new Event('customer_address_changed'));
  }

  function handleStartAddAddress() {
    setEditingAddressId(null);
    setNewLabel('Home');
    setNewRecipient('');
    setNewPhone('');
    setNewStreet('');
    setNewLandmark('');
    setNewCity('');
    setNewState('');
    setNewPinCode('');
    setNewPoint(null);
    setShowAddForm(true);
  }

  function handleStartEditAddress(addr: SavedAddress) {
    setEditingAddressId(addr.id);
    setNewLabel(addr.label || 'Home');
    setNewRecipient(addr.recipientName || '');
    setNewPhone(addr.phone || '');
    setNewStreet(addr.street || '');
    setNewLandmark(addr.landmark || '');
    setNewCity(addr.city || '');
    setNewState(addr.state || '');
    setNewPinCode(addr.zip || '');
    setNewPoint(addr.latitude !== undefined && addr.longitude !== undefined ? { latitude: addr.latitude, longitude: addr.longitude } : null);
    setShowAddForm(true);
  }

  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    const recipientTrimmed = newRecipient.trim();
    if (!recipientTrimmed) {
      toast.error('Please enter recipient name');
      return;
    }
    if (recipientTrimmed.length < 3) {
      toast.error('Recipient name must be at least 3 letters');
      return;
    }

    const phoneDigits = newPhone.replace(/\D/g, '');
    if (!newPhone.trim()) {
      toast.error('Please enter contact phone number');
      return;
    }
    if (phoneDigits.length !== 10) {
      toast.error('Contact phone number must be exactly 10 digits');
      return;
    }
    const trimmedStreet = newStreet.trim();
    if (!trimmedStreet) {
      toast.error('Please enter building & street address');
      return;
    }
    if (!newCity.trim()) {
      toast.error('Please enter city');
      return;
    }
    if (!newState.trim()) {
      toast.error('Please enter state');
      return;
    }
    if (!newPinCode.trim()) {
      toast.error('Please enter pin code');
      return;
    }

    const cityStateZipStr = [newCity.trim(), newState.trim(), newPinCode.trim()].filter(Boolean).join(', ');

    if (editingAddressId) {
      // Editing existing address
      const updated = addressList.map((addr) => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            label: newLabel.trim() || 'Home',
            recipientName: newRecipient.trim(),
            phone: newPhone.trim(),
            street: trimmedStreet,
            landmark: newLandmark.trim() || undefined,
            city: newCity.trim(),
            state: newState.trim(),
            zip: newPinCode.trim(),
            cityStateZip: cityStateZipStr,
            latitude: newPoint?.latitude,
            longitude: newPoint?.longitude
          };
        }
        return addr;
      });

      setAddressList(updated);
      localStorage.setItem('customer_saved_addresses', JSON.stringify(updated));

      if (activeAddressId === editingAddressId) {
        const sel = updated.find((a) => a.id === editingAddressId);
        if (sel) {
          const parts = [
            sel.street,
            sel.landmark ? `(Near ${sel.landmark.replace(/^near\s+/i, '')})` : undefined,
            sel.cityStateZip || [sel.city, sel.state, sel.zip].filter(Boolean).join(', ')
          ].filter(Boolean);
          localStorage.setItem('customer_saved_address', parts.join(', '));
        }
        window.dispatchEvent(new Event('customer_address_changed'));
      }

      toast.success('Address updated successfully!');
    } else {
      // Adding new address
      const newAddr: SavedAddress = {
        id: Date.now().toString(),
        label: newLabel.trim() || 'Home',
        recipientName: newRecipient.trim(),
        phone: newPhone.trim(),
        street: trimmedStreet,
        landmark: newLandmark.trim() || undefined,
        city: newCity.trim(),
        state: newState.trim(),
        zip: newPinCode.trim(),
        cityStateZip: cityStateZipStr,
        latitude: newPoint?.latitude,
        longitude: newPoint?.longitude
      };

      const updated = [...addressList, newAddr];
      setAddressList(updated);
      localStorage.setItem('customer_saved_addresses', JSON.stringify(updated));
      handleSelectActive(newAddr.id);
      toast.success('New delivery address added & activated!');
    }

    // Reset form
    setNewStreet('');
    setNewLandmark('');
    setNewCity('');
    setNewState('');
    setNewPinCode('');
    setNewPoint(null);
    setNewRecipient('');
    setNewPhone('');
    setEditingAddressId(null);
    setShowAddForm(false);
  }

  function handleDeleteAddress(id: string) {
    if (addressList.length <= 1) {
      toast.error('You must keep at least one saved delivery address');
      return;
    }
    const updated = addressList.filter((a) => a.id !== id);
    setAddressList(updated);
    localStorage.setItem('customer_saved_addresses', JSON.stringify(updated));
    if (activeAddressId === id) {
      handleSelectActive(updated[0].id);
    } else {
      window.dispatchEvent(new Event('customer_address_changed'));
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
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-5">
      {/* Top Header Section */}
      <div className="pb-3 border-b border-slate-200/60 mb-4">
        {/* Page Header (Rich Light Blue Theme) */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-100/90 via-sky-50 to-indigo-100/80 p-4 sm:p-5 text-slate-900 shadow-xs">
          <div className="absolute -right-8 -top-8 size-48 rounded-full bg-sky-300/30 blur-2xl pointer-events-none" />
          <div className="absolute right-28 -bottom-8 size-36 rounded-full bg-indigo-300/30 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-200/80 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-300/70 mb-1.5">
                <Sparkles className="size-3 text-[#F58220]" />
                <span>Customer Preferences</span>
              </div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Delivery Addresses
              </h1>
              <p className="mt-0.5 text-xs font-medium text-slate-600 max-w-lg">
                Manage saved locations for instant 1-click checkout and seamless order fulfillment.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-end text-right border-r border-sky-200/80 pr-3.5">
                <span className="text-xl font-black text-[#0F172A]">{addressList.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Saved Locations</span>
              </div>
              <Button
                type="button"
                onClick={handleStartAddAddress}
                className="h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all shadow-md shadow-sky-600/20 px-4 cursor-pointer gap-1.5 text-xs"
              >
                <Plus className="size-3.5" /> Add New Address
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 items-start">
        {/* Left Column: Saved Addresses List (Internal scroll if list is long) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-sky-900/70">
              Saved Addresses ({addressList.length})
            </h2>
            <span className="text-[10px] font-semibold text-slate-400">Click card to set default</span>
          </div>

          <div className="max-h-[520px] overflow-y-auto pr-1 space-y-2.5">
            {addressList.map((addr) => {
              const selected = addr.id === activeAddressId;
              const fullAddress = [addr.street, addr.cityStateZip].filter(Boolean).join(', ');

              return (
                <motion.div
                  key={addr.id}
                  whileHover={{ y: -1 }}
                  onClick={() => {
                    if (!selected) {
                      setSelectConfirmAddress(addr);
                    }
                  }}
                  className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                    selected
                      ? 'border-sky-500 bg-gradient-to-r from-sky-50/90 via-sky-50/50 to-indigo-50/30 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/20 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Icon & Details */}
                    <div className="flex items-start gap-3">
                      {/* Address Type Icon Badge */}
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                          selected
                            ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-500/30'
                            : 'bg-sky-100/70 text-sky-700 group-hover:bg-sky-200/80'
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
                        {addr.latitude !== undefined ? (
                          <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="size-3" /> Map pin set</p>
                        ) : (
                          <p className="mt-1.5 text-[11px] font-medium text-amber-700">No map pin yet. Edit this address and drop a pin so the rider finds you faster.</p>
                        )}
                      </div>
                    </div>

                    {/* Checkmark, Edit & Delete Actions */}
                    <div className="flex items-center gap-1.5">
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
                            setSelectConfirmAddress(addr);
                          }}
                          className="h-8 rounded-full text-xs font-bold text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                        >
                          Use This
                        </Button>
                      )}

                      {/* Edit Address Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditAddress(addr);
                        }}
                        className="text-slate-400 hover:text-sky-600 transition-colors p-1.5 cursor-pointer rounded-xl hover:bg-sky-50"
                        title="Edit Address"
                      >
                        <Pencil className="size-4" />
                      </button>

                      {addressList.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmAddress(addr);
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 cursor-pointer rounded-xl hover:bg-rose-50"
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

        {/* Right Column: Add Address Form or Active Summary Widget (Sticky) */}
        <div className="md:col-span-5 md:sticky md:top-20">
          <AnimatePresence mode="wait">
            {showAddForm ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="rounded-2xl border border-sky-200 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-sm space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                      {editingAddressId ? <Pencil className="size-3.5" /> : <Plus className="size-3.5" />}
                    </div>
                    <h3 className="font-heading text-sm font-extrabold text-slate-900">
                      {editingAddressId ? 'Edit Delivery Address' : 'Add New Address'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setShowAddForm(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-3">
                  {/* Address Type Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Address Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Home', icon: Home },
                        { label: 'Work', icon: Briefcase },
                        { label: 'Other', icon: Building2 }
                      ].map(({ label, icon: Icon }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setNewLabel(label)}
                          className={`flex items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            newLabel === label
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="size-3" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Recipient Name <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        minLength={3}
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="e.g. John Doe (min 3 letters)"
                        className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Contact Phone <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        maxLength={10}
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                      />
                    </div>
                  </div>

                  {/* Shop / Building and Street */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Shop / Building and Street <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      required
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      placeholder="e.g. Shop 12, Market Road"
                      className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                    />
                  </div>

                  {/* Landmark (optional) */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      Landmark <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <Input
                      value={newLandmark}
                      onChange={(e) => setNewLandmark(e.target.value)}
                      placeholder="e.g. Near City Mall"
                      className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500"
                    />
                  </div>

                  {/* 3-Column Row: City, State, Pin Code */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Hyderabad"
                        className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500 px-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        placeholder="Telangana"
                        className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500 px-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Pin Code <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={newPinCode}
                        onChange={(e) => setNewPinCode(e.target.value)}
                        placeholder="500001"
                        className="h-9 rounded-xl text-xs bg-white border-slate-200 focus-visible:ring-sky-500 px-2.5"
                      />
                    </div>
                  </div>

                  {/* Map pin: lets the rider find the exact spot and gives a real arrival time */}
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                      Pin on map <span className="text-slate-400 font-normal lowercase">(recommended)</span>
                    </label>
                    <MapPinPicker value={newPoint} onChange={setNewPoint} />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingAddressId(null);
                        setShowAddForm(false);
                      }}
                      className="w-1/3 h-9 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-2/3 h-9 rounded-xl font-bold bg-sky-600 text-white hover:bg-sky-700 gap-1.5 shadow-xs cursor-pointer text-xs"
                    >
                      <CheckCircle2 className="size-3.5" /> {editingAddressId ? 'Update Address' : 'Save & Activate'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3.5"
              >
                {/* Delivery Guarantee Badge */}
                <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-sky-900">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white shadow-xs">
                    <Truck className="size-4" />
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
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Active Destination</span>
                      <span className="font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full text-[10px]">
                        {activeAddress.label}
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <p className="text-xs font-bold text-slate-900">
                        {activeAddress.recipientName || 'Valued Customer'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600 font-medium leading-relaxed">
                        {[activeAddress.street, activeAddress.cityStateZip].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <Button
                    type="button"
                    onClick={handleStartAddAddress}
                    className="w-full h-10 rounded-xl border-dashed border-sky-300 text-sky-700 font-bold bg-sky-50/60 hover:bg-sky-100 transition-all gap-1.5 text-xs cursor-pointer shadow-2xs"
                  >
                    <Plus className="size-3.5" /> Add Another Location
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-0.5 font-medium">
                    <ShieldCheck className="size-3 text-emerald-500" /> Safe & encrypted address storage
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Dialog: Set Active Address */}
      <Dialog open={!!selectConfirmAddress} onOpenChange={(open) => !open && setSelectConfirmAddress(null)}>
        <DialogContent className="sm:max-w-md border-sky-200">
          <DialogHeader>
            <div className="flex items-center gap-2 text-sky-700 mb-1">
              <div className="flex size-8 items-center justify-center rounded-full bg-sky-100">
                <CheckCircle2 className="size-4 text-sky-600" />
              </div>
              <DialogTitle className="font-heading text-lg font-bold text-slate-900">
                Change Active Address?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600">
              Are you sure you want to set this as your default delivery location for checkout?
            </DialogDescription>
          </DialogHeader>

          {selectConfirmAddress && (
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>{selectConfirmAddress.label}</span>
                {selectConfirmAddress.recipientName && (
                  <span className="text-slate-500 font-normal">({selectConfirmAddress.recipientName})</span>
                )}
              </div>
              <div className="text-slate-600 leading-relaxed">
                {[selectConfirmAddress.street, selectConfirmAddress.cityStateZip].filter(Boolean).join(', ')}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectConfirmAddress(null)}
              className="rounded-xl h-9 text-xs font-bold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (selectConfirmAddress) {
                  handleSelectActive(selectConfirmAddress.id);
                  setSelectConfirmAddress(null);
                }
              }}
              className="rounded-xl h-9 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
            >
              Confirm & Use Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Delete Address */}
      <Dialog open={!!deleteConfirmAddress} onOpenChange={(open) => !open && setDeleteConfirmAddress(null)}>
        <DialogContent className="sm:max-w-md border-rose-200">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <div className="flex size-8 items-center justify-center rounded-full bg-rose-100">
                <AlertTriangle className="size-4 text-rose-600" />
              </div>
              <DialogTitle className="font-heading text-lg font-bold text-slate-900">
                Delete Delivery Address?
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteConfirmAddress && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>{deleteConfirmAddress.label}</span>
                {deleteConfirmAddress.recipientName && (
                  <span className="text-slate-500 font-normal">({deleteConfirmAddress.recipientName})</span>
                )}
              </div>
              <div className="text-slate-600 leading-relaxed">
                {[deleteConfirmAddress.street, deleteConfirmAddress.cityStateZip].filter(Boolean).join(', ')}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmAddress(null)}
              className="rounded-xl h-9 text-xs font-bold border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (deleteConfirmAddress) {
                  handleDeleteAddress(deleteConfirmAddress.id);
                  setDeleteConfirmAddress(null);
                }
              }}
              className="rounded-xl h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              Delete Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


