// Personal, vehicle, address and emergency details. Locked fields (after the application is sent) are read-only.
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Bike, HeartPulse, Home, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiError } from '@/shared/api/api-error';
import { updateMyProfile } from '@/features/delivery/api/rider-api';
import { VEHICLE_LABELS } from '@/features/delivery/lib/delivery-labels';
import type { Rider, RiderProfileFields, VehicleType } from '@/features/delivery/types/delivery-types';
import { useRiderProfileMutation } from '../hooks/use-rider-queries';
import { Field } from './field';
import { FormSection } from './form-section';

const ALWAYS_EDITABLE = new Set<keyof RiderProfileFields>(['address_line', 'area', 'city', 'pincode', 'emergency_contact_name', 'emergency_contact_phone', 'upi_id']);

function pickFields(rider: Rider): RiderProfileFields {
  const { full_name, date_of_birth, vehicle_type, vehicle_number, license_number, license_expiry, address_line, area, city, pincode, emergency_contact_name, emergency_contact_phone, upi_id } = rider;
  return { full_name, date_of_birth, vehicle_type, vehicle_number, license_number, license_expiry, address_line, area, city, pincode, emergency_contact_name, emergency_contact_phone, upi_id };
}

export function RiderProfileForm({ rider, onSaved, submitLabel = 'Save details' }: { rider: Rider; onSaved?(): void; submitLabel?: string }) {
  const [form, setForm] = useState<RiderProfileFields>(() => pickFields(rider));
  const [touched, setTouched] = useState(false);
  const save = useRiderProfileMutation(updateMyProfile);
  const fullyEditable = rider.status === 'draft' || rider.status === 'rejected';
  const isBicycle = form.vehicle_type === 'bicycle';

  // Show fresh details when they change elsewhere (an admin review, a live update), unless the rider is mid-edit.
  useEffect(() => {
    if (!touched) setForm(pickFields(rider));
  }, [rider, touched]);

  const set = (key: keyof RiderProfileFields) => (value: string) => {
    setTouched(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const locked = (key: keyof RiderProfileFields) => !fullyEditable && !ALWAYS_EDITABLE.has(key);
  const input = (key: keyof RiderProfileFields) => ({ id: key, value: form[key], onChange: (e: { target: { value: string } }) => set(key)(e.target.value), disabled: locked(key) });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate(form, {
      onSuccess: () => {
        setTouched(false);
        toast.success('Details saved');
        onSaved?.();
      },
      onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Could not save your details')
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {!fullyEditable && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">Your name, date of birth and vehicle details are locked while your application is reviewed or active. Address, emergency contact and UPI can still be changed.</p>}

      <FormSection icon={UserRound} title="About you" description="Use your name exactly as it appears on your licence and ID.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required {...input('full_name')} />
          <Field label="Date of birth" type="date" required max={new Date().toISOString().slice(0, 10)} {...input('date_of_birth')} />
        </div>
      </FormSection>

      <FormSection icon={Bike} title="Vehicle and licence" description="Bicycles do not need a number plate or driving licence.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label className="text-xs font-semibold text-slate-700">Vehicle type <span className="text-rose-500">*</span></Label>
            <Select value={form.vehicle_type} onValueChange={(v) => set('vehicle_type')(v as VehicleType)} disabled={locked('vehicle_type')}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose your vehicle" /></SelectTrigger>
              <SelectContent>{(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((type) => <SelectItem key={type} value={type}>{VEHICLE_LABELS[type]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Field label="Number plate" placeholder="e.g. TS09 AB 1234" required={!isBicycle} className="uppercase" {...input('vehicle_number')} />
          <Field label="Driving licence number" placeholder="e.g. TS0920190001234" required={!isBicycle} className="uppercase" {...input('license_number')} />
          <Field label="Licence valid until" type="date" required={!isBicycle} min={new Date().toISOString().slice(0, 10)} {...input('license_expiry')} />
        </div>
      </FormSection>

      <FormSection icon={Home} title="Where you live" description="Used to send you orders in your area.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="House / street" required {...input('address_line')} /></div>
          <Field label="Area / locality" required {...input('area')} />
          <Field label="City" required {...input('city')} />
          <Field label="Pincode" inputMode="numeric" maxLength={6} required {...input('pincode')} />
        </div>
      </FormSection>

      <FormSection icon={HeartPulse} title="Emergency contact and payouts" description="We call this person only if something happens to you on a delivery.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name" required {...input('emergency_contact_name')} />
          <Field label="Contact phone" type="tel" required {...input('emergency_contact_phone')} />
          <div className="sm:col-span-2"><Field label="UPI ID for payouts" placeholder="name@bank (optional)" {...input('upi_id')} /></div>
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={save.isPending} className="w-full sm:w-auto">{save.isPending ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
