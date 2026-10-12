// Saved delivery addresses: add, edit, remove, and choose the active one that checkout uses.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/text';
import { Icon, type IconName } from '@/components/icon';
import { Badge, Button, Card, EmptyState, Field, Loading, Pills, Screen } from '@/components/ui';
import { useToast } from '@/components/toast';
import { MapPicker } from '@/components/map-picker';
import { addressLocation, useAddresses, type SavedAddress } from '@/features/shop/addresses';
import { describePlace, readCurrentPosition, type Coords } from '@/lib/location';
import { errorMessage } from '@/lib/api';
import { colors, radius, shadow, space, text } from '@/theme/theme';
import { useBrand } from '@/lib/brand';

const LABEL_ICONS: Record<string, IconName> = { Home: 'home', Work: 'store', Other: 'map-pin' };
const EMPTY = { label: 'Home', recipientName: '', phone: '', street: '', landmark: '', city: '', state: '', zip: '' };

function isAllDigits(text: string) {
  return text.length > 0 && [...text].every((character) => character >= '0' && character <= '9');
}

export default function AddressesScreen() {
  const brand = useBrand();
  const { addresses, active, isLoading, save, remove, setActive } = useAddresses();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  // The spot on the map for the address being written, and whether the map is open.
  const [pin, setPin] = useState<Coords | null>(null);
  const [mapStart, setMapStart] = useState<Coords | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  if (isLoading) return <Loading />;

  const set = (key: keyof typeof EMPTY) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  // Fills street, city, state and pincode from a spot on the map. Name and phone are never touched.
  async function fillFrom(coords: Coords) {
    setPin(coords);
    try {
      const place = await describePlace(coords);
      setForm((current) => ({
        ...current,
        street: current.street.trim() ? current.street : place.street,
        city: place.city || current.city,
        state: place.state || current.state,
        zip: place.zip || current.zip
      }));
    } catch {
      toast('Saved the spot, but could not read the address. Please type it in.', 'info');
    }
  }

  async function useMyLocation() {
    setLocating(true);
    try {
      const coords = await readCurrentPosition();
      setMapStart(coords);
      await fillFrom(coords);
    } catch (err) {
      toast(errorMessage(err, 'We could not find your location'), 'error');
    } finally {
      setLocating(false);
    }
  }

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setPin(null);
    setMapStart(null);
    setShowMap(false);
    setShowForm(true);
  }

  function startEdit(address: SavedAddress) {
    setEditingId(address.id);
    setPin(address.latitude !== undefined && address.longitude !== undefined ? { latitude: address.latitude, longitude: address.longitude } : null);
    setMapStart(null);
    setShowMap(false);
    setForm({ label: address.label, recipientName: address.recipientName, phone: address.phone, street: address.street, landmark: address.landmark ?? '', city: address.city, state: address.state, zip: address.zip });
    setShowForm(true);
  }

  async function submit() {
    const recipient = form.recipientName.trim();
    const phone = form.phone.trim();
    if (recipient.length < 3) return toast('Recipient name must be at least 3 letters', 'error');
    if (phone.length !== 10 || !isAllDigits(phone)) return toast('Contact phone must be exactly 10 digits', 'error');
    if (!form.street.trim()) return toast('Enter the building and street', 'error');
    if (!form.city.trim()) return toast('Enter the city', 'error');
    if (!form.state.trim()) return toast('Enter the state', 'error');
    if (form.zip.trim().length !== 6 || !isAllDigits(form.zip.trim())) return toast('Pincode must be 6 digits', 'error');

    await save({
      id: editingId ?? Date.now().toString(),
      label: form.label,
      recipientName: recipient,
      phone,
      street: form.street.trim(),
      landmark: form.landmark.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
      latitude: pin?.latitude,
      longitude: pin?.longitude
    });
    toast(editingId ? 'Address updated' : 'Address added and set as active', 'success');
    setShowForm(false);
    setEditingId(null);
  }

  async function askOrRemove(id: string) {
    if (confirmId !== id) { setConfirmId(id); return; }
    await remove(id);
    setConfirmId(null);
    toast('Address removed', 'success');
  }

  return (
    <Screen>
      {!showForm && <Button icon="plus" label="Add new address" onPress={startAdd} />}

      {showForm && (
        <Card title={editingId ? 'Edit delivery address' : 'New delivery address'} icon="map-pin">
          <View style={[styles.locationBox, { backgroundColor: brand.primarySoft, borderColor: brand.primaryTint }]}>
            <Text style={text.label}>Where should we deliver?</Text>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ flex: 1 }}><Button small icon="navigation" label={locating ? 'Finding you…' : 'Use my location'} onPress={() => void useMyLocation()} loading={locating} /></View>
              <View style={{ flex: 1 }}><Button small variant="outline" icon="map" label={showMap ? 'Hide map' : 'Pick on map'} onPress={() => { if (!showMap && !(mapStart ?? pin)) void useMyLocation(); setShowMap((open) => !open); }} /></View>
            </View>
            {pin ? <Text style={[text.small, { color: colors.success }]}>Spot saved. Check the address below.</Text> : <Text style={text.small}>Or type the address by hand below.</Text>}
            {showMap && (mapStart ?? pin) ? <MapPicker center={(mapStart ?? pin) as Coords} onPick={(coords) => void fillFrom(coords)} height={240} /> : null}
            {showMap && !(mapStart ?? pin) ? <Text style={text.small}>Finding where to open the map…</Text> : null}
          </View>

          <View style={{ gap: 6 }}>
            <Text style={text.label}>Address type</Text>
            <Pills options={['Home', 'Work', 'Other'].map((label) => ({ value: label, label }))} value={form.label} onChange={set('label')} />
          </View>
          <Field label="Recipient name" value={form.recipientName} onChangeText={set('recipientName')} placeholder="e.g. John Doe" />
          <Field label="Contact phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" maxLength={10} placeholder="10-digit mobile number" />
          <Field label="Shop / building and street" value={form.street} onChangeText={set('street')} placeholder="e.g. Shop 12, Market Road" />
          <Field label="Landmark (optional)" value={form.landmark} onChangeText={set('landmark')} placeholder="e.g. Near City Mall" />
          <Field label="City" value={form.city} onChangeText={set('city')} placeholder="Hyderabad" />
          <Field label="State" value={form.state} onChangeText={set('state')} placeholder="Telangana" />
          <Field label="Pincode" value={form.zip} onChangeText={set('zip')} keyboardType="number-pad" maxLength={6} placeholder="500001" />
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={{ flex: 1 }}><Button variant="outline" label="Cancel" onPress={() => { setShowForm(false); setEditingId(null); }} /></View>
            <View style={{ flex: 2 }}><Button icon="check" label={editingId ? 'Update address' : 'Save and use'} onPress={() => void submit()} /></View>
          </View>
        </Card>
      )}

      {addresses.length === 0 && !showForm ? (
        <EmptyState icon="map-pin" message="No saved addresses yet. Add one to check out faster." />
      ) : addresses.map((address) => {
        const isActive = active?.id === address.id;
        return (
          <View key={address.id} style={[styles.row, isActive && [styles.rowActive, { borderColor: brand.primary, backgroundColor: brand.primarySoft }]]}>
            <View style={styles.top}>
              <View style={[styles.icon, { backgroundColor: brand.primaryTint }]}><Icon name={LABEL_ICONS[address.label] ?? 'map-pin'} size={18} color={brand.primary} /></View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
                  <Text style={text.heading}>{address.label}</Text>
                  {isActive && <Badge tone="success" label="Active address" />}
                </View>
                <Text style={text.small}>{address.recipientName} · {address.phone}</Text>
              </View>
            </View>
            <Text style={text.body}>{addressLocation(address)}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {!isActive && <Button small icon="check" label="Use this" onPress={() => void setActive(address.id)} />}
              <Button small variant="outline" icon="edit-3" label="Edit" onPress={() => startEdit(address)} />
              <Button small variant={confirmId === address.id ? 'danger' : 'outline'} icon="trash-2" label={confirmId === address.id ? 'Tap again to remove' : 'Remove'} onPress={() => void askOrRemove(address.id)} />
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  locationBox: { gap: space.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primaryTint, padding: space.md },
  row: { gap: space.md, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: space.lg, ...shadow },
  rowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }
});
