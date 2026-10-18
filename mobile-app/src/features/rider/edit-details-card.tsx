// The rider's own details they can change at any time: address, emergency contact and UPI ID.
// Name, vehicle and licence stay as the admin approved them (the server enforces this too).
import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/text';
import { Button, Card, Field, InfoRow } from '@/components/ui';
import { useToast } from '@/components/toast';
import { errorMessage } from '@/lib/api';
import { space, text } from '@/theme/theme';
import type { Rider } from '@/types/delivery';
import { riderCalls, useRiderAction } from './rider-api';

type Details = Pick<Rider, 'address_line' | 'area' | 'city' | 'pincode' | 'emergency_contact_name' | 'emergency_contact_phone' | 'upi_id'>;

function detailsOf(rider: Rider): Details {
  return {
    address_line: rider.address_line ?? '',
    area: rider.area ?? '',
    city: rider.city ?? '',
    pincode: rider.pincode ?? '',
    emergency_contact_name: rider.emergency_contact_name ?? '',
    emergency_contact_phone: rider.emergency_contact_phone ?? '',
    upi_id: rider.upi_id ?? ''
  };
}

export function EditDetailsCard({ rider }: { rider: Rider }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Details>(detailsOf(rider));
  const save = useRiderAction(riderCalls.updateProfile);
  const toast = useToast();
  const set = (key: keyof Details) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  function startEditing() {
    setForm(detailsOf(rider));
    setEditing(true);
  }

  function handleSave() {
    save.mutate(form, {
      onSuccess: () => { toast('Details saved', 'success'); setEditing(false); },
      onError: (err) => toast(errorMessage(err), 'error')
    });
  }

  if (!editing) {
    return (
      <Card title="My details" icon="user">
        <InfoRow label="Address" value={[rider.address_line, rider.area, rider.city, rider.pincode].filter(Boolean).join(', ') || '—'} />
        <InfoRow label="Emergency contact" value={rider.emergency_contact_name ? `${rider.emergency_contact_name} · ${rider.emergency_contact_phone}` : '—'} />
        <InfoRow label="UPI ID" value={rider.upi_id || '—'} />
        <Button small variant="outline" icon="edit-3" label="Edit details" onPress={startEditing} />
      </Card>
    );
  }

  return (
    <Card title="Edit my details" icon="edit-3">
      <Text style={text.small}>Name, vehicle and licence can only be changed by support, since an admin checked them.</Text>
      <Field label="Address" value={form.address_line} onChangeText={set('address_line')} placeholder="House no., street" />
      <Field label="Area" value={form.area} onChangeText={set('area')} placeholder="e.g. Gajwel" />
      <Field label="City" value={form.city} onChangeText={set('city')} placeholder="e.g. Hyderabad" />
      <Field label="Pincode" value={form.pincode} onChangeText={set('pincode')} keyboardType="number-pad" maxLength={6} placeholder="e.g. 502278" />
      <Field label="Emergency contact name" value={form.emergency_contact_name} onChangeText={set('emergency_contact_name')} placeholder="Someone we can call" />
      <Field label="Emergency contact phone" value={form.emergency_contact_phone} onChangeText={set('emergency_contact_phone')} keyboardType="phone-pad" placeholder="10-digit number" />
      <Field label="UPI ID" hint="Where your payouts go" value={form.upi_id} onChangeText={set('upi_id')} autoCapitalize="none" placeholder="name@bank" />
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}><Button variant="outline" label="Cancel" onPress={() => setEditing(false)} disabled={save.isPending} /></View>
        <View style={{ flex: 1 }}><Button icon="save" label="Save" onPress={handleSave} loading={save.isPending} /></View>
      </View>
    </Card>
  );
}
