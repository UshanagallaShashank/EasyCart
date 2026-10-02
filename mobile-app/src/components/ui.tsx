// Building blocks every screen uses, in the website's look: white rounded cards on slate, sky buttons, soft badges.
import { type ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, shadow, space, text, toneColors, type Tone } from '@/theme/theme';
import { fileUrl } from '@/lib/api';

export type IconName = keyof typeof Feather.glyphMap;

// Scrollable page with pull-to-refresh and comfortable phone margins (wider screens get a centred column).
export function Screen({ children, onRefresh, refreshing = false, footer }: { children: ReactNode; onRefresh?(): void; refreshing?: boolean; footer?: ReactNode }) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        <View style={styles.column}>{children}</View>
      </ScrollView>
      {footer && <View style={styles.footer}><View style={styles.column}>{footer}</View></View>}
    </View>
  );
}

export function Card({ children, style, title, icon, right }: { children: ReactNode; style?: ViewStyle; title?: string; icon?: IconName; right?: ReactNode }) {
  return (
    <View style={[styles.card, style]}>
      {(title || right) && (
        <View style={styles.cardHeader}>
          <View style={styles.rowCenter}>
            {icon && <View style={styles.iconBubble}><Feather name={icon} size={16} color={colors.primary} /></View>}
            {title && <Text style={text.heading}>{title}</Text>}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost' | 'success';

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, small }: { label: string; onPress(): void; variant?: ButtonVariant; icon?: IconName; loading?: boolean; disabled?: boolean; small?: boolean }) {
  const look = BUTTONS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, small && styles.buttonSmall, { backgroundColor: look.bg, borderColor: look.border }, pressed && { opacity: 0.85 }, inactive && { opacity: 0.5 }]}
    >
      {loading ? <ActivityIndicator color={look.fg} size="small" /> : icon && <Feather name={icon} size={small ? 14 : 16} color={look.fg} />}
      <Text style={[styles.buttonText, small && { fontSize: 13 }, { color: look.fg }]}>{label}</Text>
    </Pressable>
  );
}

const BUTTONS: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  success: { bg: colors.success, fg: colors.white, border: colors.success },
  outline: { bg: colors.white, fg: colors.text, border: colors.border },
  danger: { bg: colors.white, fg: colors.danger, border: '#fecdd3' },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' }
};

export function Field({ label, hint, error, ...props }: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor={colors.textFaint} style={[styles.input, props.multiline && { minHeight: 80, textAlignVertical: 'top' }]} {...props} />
      {error ? <Text style={[text.small, { color: colors.danger }]}>{error}</Text> : hint ? <Text style={text.small}>{hint}</Text> : null}
    </View>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const look = toneColors[tone];
  return <Text style={[styles.badge, { color: look.fg, backgroundColor: look.bg }]}>{label}</Text>;
}

export function InfoRow({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: Tone }) {
  const color = tone ? toneColors[tone].fg : strong ? colors.text : colors.textMuted;
  return (
    <View style={styles.infoRow}>
      <Text style={[text.muted, { color: tone ? color : colors.textMuted }, strong && { fontWeight: '700', color }]}>{label}</Text>
      <Text style={[text.body, { color, fontVariant: ['tabular-nums'] }, strong && { fontWeight: '700' }]}>{value}</Text>
    </View>
  );
}

export function Notice({ children, tone = 'primary', icon = 'info' }: { children: ReactNode; tone?: Tone; icon?: IconName }) {
  const look = toneColors[tone];
  return (
    <View style={[styles.notice, { backgroundColor: look.bg }]}>
      <Feather name={icon} size={16} color={look.fg} style={{ marginTop: 1 }} />
      <Text style={[text.muted, { color: look.fg, flex: 1 }]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ message, icon = 'package', action }: { message: string; icon?: IconName; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.iconBubble, { width: 44, height: 44, borderRadius: 14 }]}><Feather name={icon} size={20} color={colors.primary} /></View>
      <Text style={[text.muted, { textAlign: 'center' }]}>{message}</Text>
      {action}
    </View>
  );
}

export function Loading() {
  return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
}

// Row of choices that filter a list, like the website's filter pills.
export function Pills<T extends string>({ options, value, onChange }: { options: { value: T; label: string; count?: number }[]; value: T; onChange(v: T): void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.pill, active && styles.pillActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
            <Text style={[styles.pillText, active && { color: colors.white }]}>{option.label}{option.count !== undefined ? `  ${option.count}` : ''}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// Today's numbers side by side in one strip.
export function StatStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <View style={[styles.card, styles.strip]}>
      {items.map((item, index) => (
        <View key={item.label} style={[styles.stripCell, index > 0 && { borderLeftWidth: 1, borderLeftColor: colors.borderSoft }]}>
          <Text style={styles.stripValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
          <Text style={[text.small, { textAlign: 'center' }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

// Big digit box for one-time codes.
export function CodeInput({ length, value, onChange, label }: { length: number; value: string; onChange(v: string): void; label: string }) {
  return (
    <TextInput
      accessibilityLabel={label}
      value={value}
      onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
      keyboardType="number-pad"
      maxLength={length}
      placeholder={'•'.repeat(length)}
      placeholderTextColor={colors.border}
      style={styles.code}
    />
  );
}

export function Avatar({ name, photoUrl, size = 48 }: { name: string; photoUrl?: string | null; size?: number }) {
  const src = fileUrl(photoUrl);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
  if (src) return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryTint }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.primaryDark, fontWeight: '700', fontSize: size / 3 }}>{initials}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={[styles.rowBetween, { marginTop: space.sm }]}>
      <Text style={text.heading}>{children}</Text>
      {right}
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: space.lg, paddingBottom: space.xxl * 2 },
  column: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: space.md },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, padding: space.md },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: space.lg, gap: space.md, ...shadow },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  iconBubble: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 46, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  buttonSmall: { minHeight: 36, paddingHorizontal: space.md },
  buttonText: { fontSize: 15, fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#334155' },
  input: { minHeight: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: space.md, fontSize: 15, color: colors.text },
  badge: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md, paddingVertical: 2 },
  notice: { flexDirection: 'row', gap: space.sm, borderRadius: radius.md, padding: space.md },
  empty: { alignItems: 'center', gap: space.md, padding: space.xxl, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border },
  loading: { padding: space.xxl * 2, alignItems: 'center' },
  pill: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center' },
  pillActive: { backgroundColor: colors.text, borderColor: colors.text },
  pillText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  strip: { flexDirection: 'row', paddingHorizontal: 0, paddingVertical: space.md, gap: 0 },
  stripCell: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: space.sm },
  stripValue: { fontSize: 18, fontWeight: '700', color: colors.text, fontVariant: ['tabular-nums'] },
  code: { height: 60, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white, textAlign: 'center', fontSize: 28, fontWeight: '700', letterSpacing: 12, color: colors.text, fontFamily: 'monospace' }
});
