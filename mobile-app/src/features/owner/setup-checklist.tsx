// Helps a new store owner get set up: a short checklist that disappears once the shop is ready, and a card to share the shop code.
import { Share, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Text } from '@/components/text';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { Button, Card } from '@/components/ui';
import { accents, colors, radius, space, text } from '@/theme/theme';
import type { OwnerStore } from './owner-api';
import { useBrand } from '@/lib/brand';

interface Step { label: string; hint: string; done: boolean; href: Href }

export function SetupChecklist({ store, productCount }: { store: OwnerStore; productCount: number }) {
  const brand = useBrand();
  const steps: Step[] = [
    { label: 'Add your first products', hint: 'Customers need something to buy', done: productCount > 0, href: '/owner/products' },
    { label: 'Add your shop address', hint: 'Shown to customers and used for pickup', done: Boolean(store.address), href: '/owner/store-settings' },
    { label: 'Pin your shop location', hint: 'So riders near your shop see your deliveries', done: store.latitude != null, href: '/owner/store-settings' },
    { label: 'Publish your shop', hint: 'Open it to customers', done: store.is_published, href: '/owner/store-settings' }
  ];
  const finished = steps.filter((step) => step.done).length;
  if (finished === steps.length) return null;

  return (
    <Card title="Set up your shop" icon="sparkles" right={<Text style={[styles.count, { color: brand.primary }]}>{finished} of {steps.length}</Text>}>
      <View style={styles.track}><View style={[[styles.fill, { backgroundColor: brand.primary }], { width: `${(finished / steps.length) * 100}%` }]} /></View>
      {steps.map((step) => (
        <PressScale key={step.label} onPress={() => router.push(step.href)} style={styles.row} accessibilityRole="button">
          <View style={[styles.check, step.done && styles.checkDone]}>
            {step.done ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, step.done && styles.labelDone]}>{step.label}</Text>
            {!step.done ? <Text style={text.small}>{step.hint}</Text> : null}
          </View>
          {!step.done ? <Icon name="chevron-right" size={18} color={colors.textFaint} /> : null}
        </PressScale>
      ))}
    </Card>
  );
}

// The shop code is how customers open this shop in the app, so sharing it brings people in.
export function ShareShopCard({ store }: { store: OwnerStore }) {
  const brand = useBrand();
  function share() {
    void Share.share({ message: `Shop at ${store.name} on EasyCart. Open the EasyCart app, choose "Open a shop by its code" and enter: ${store.slug}` });
  }

  return (
    <Card title="Share your shop" icon="send">
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Your shop code</Text>
        <Text style={[styles.code, { color: brand.primaryDark }]}>{store.slug}</Text>
      </View>
      <Text style={text.small}>Customers enter this code in the app to open your shop.</Text>
      <Button icon="send" label="Share with customers" variant="outline" onPress={share} />
    </Card>
  );
}

const styles = StyleSheet.create({
  count: { fontSize: 12, fontWeight: '700', color: colors.primary },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.borderSoft, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
  label: { fontSize: 14, fontWeight: '700', color: colors.text },
  labelDone: { color: colors.textMuted, textDecorationLine: 'line-through', fontWeight: '600' },
  codeBox: { alignItems: 'center', gap: 2, backgroundColor: accents.sky.bg, borderRadius: radius.md, paddingVertical: space.lg },
  codeLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: colors.textMuted, textTransform: 'uppercase' },
  code: { fontSize: 22, fontWeight: '900', color: colors.primaryDark, letterSpacing: 1 }
});
