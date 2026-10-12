// A grouped menu, like a phone's Settings: one card, rows split by thin lines, a coloured icon tile on each row.
// Also the account header that sits above it on the "More" and profile pages.
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './text';
import { Icon, type IconName } from './icon';
import { Avatar } from './ui';
import { colors, glow, radius, shadow, space, text } from '@/theme/theme';
import { withAlpha } from '@/theme/brands';
import { useBrand } from '@/lib/brand';
import { selectFeedback } from '@/lib/feedback';

export interface MenuItem {
  icon: IconName;
  title: string;
  subtitle?: string;
  color: string;
  onPress(): void;
}

export function MenuList({ items }: { items: MenuItem[] }) {
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <Fragment key={item.title}>
          {index > 0 && <View style={styles.divider} />}
          <Pressable accessibilityRole="button" onPress={() => { selectFeedback(); item.onPress(); }} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.borderSoft }]}>
            <LinearGradient colors={[withAlpha(item.color, 0.75), item.color]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
              <Icon name={item.icon} size={18} color={colors.white} />
            </LinearGradient>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              {item.subtitle ? <Text style={text.small} numberOfLines={1}>{item.subtitle}</Text> : null}
            </View>
            <Icon name="chevron-right" size={18} color={colors.textFaint} />
          </Pressable>
        </Fragment>
      ))}
    </View>
  );
}

export function AccountCard({ name, detail, photoUrl, badge }: { name: string; detail: string; photoUrl?: string | null; badge?: ReactNode }) {
  const brand = useBrand();
  return (
    <LinearGradient colors={brand.mesh} locations={[0, 0.4, 0.75, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.account, glow(brand.glow)]}>
      <View style={styles.ring}><Avatar name={name} photoUrl={photoUrl} size={52} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.detail} numberOfLines={1}>{detail}</Text>
        {badge}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  group: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden', ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: 14 },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginLeft: space.lg + 38 + space.md },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  account: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.xl, padding: space.lg },
  ring: { borderRadius: 30, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', padding: 2 },
  name: { fontSize: 18, fontWeight: '800', color: colors.white },
  detail: { fontSize: 13, color: 'rgba(255,255,255,0.85)' }
});
