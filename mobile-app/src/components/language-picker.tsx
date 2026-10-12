// Buttons to switch language. Each shows its own name, so people can find theirs without reading English.
// `compact` is the small glass version that sits on the coloured top of the sign-in screens.
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './text';
import { PressScale } from './motion';
import { LANGUAGES, useLanguage } from '@/lib/i18n';
import { colors, radius, space } from '@/theme/theme';
import { useBrand } from '@/lib/brand';

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const brand = useBrand();
  const { language, setLanguage, available } = useLanguage();

  if (compact) {
    return (
      <View style={styles.compactRow} accessibilityRole="radiogroup" accessibilityLabel="Language">
        {LANGUAGES.map((option) => {
          const active = option.code === language;
          return (
            <PressScale key={option.code} onPress={() => setLanguage(option.code)} style={[styles.chip, active && styles.chipActive]} accessibilityRole="radio" accessibilityState={{ selected: active }} accessibilityLabel={option.label}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </PressScale>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ gap: space.sm }}>
    <View style={styles.row}>
      {LANGUAGES.map((option) => {
        const active = option.code === language;
        return (
          <PressScale
            key={option.code}
            onPress={() => { void Haptics.selectionAsync().catch(() => undefined); setLanguage(option.code); }}
            style={[styles.option, active && [styles.optionActive, { borderColor: brand.primary, backgroundColor: brand.primarySoft }]]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, active && [styles.labelActive, { color: brand.primaryDark }]]}>{option.label}</Text>
          </PressScale>
        );
      })}
    </View>
    {language !== 'en' && available === false ? (
      // Said in English on purpose: if translation is off, it cannot be shown in the other language.
      <Text style={styles.note}>Translation is not switched on yet, so the app stays in English. The admin can turn it on in the server settings.</Text>
    ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  option: { flex: 1, height: 46, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.card, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  label: { fontSize: 16, fontWeight: '700', color: colors.textSoft },
  labelActive: { color: colors.primaryDark },
  note: { fontSize: 12, color: colors.textMuted },
  compactRow: { flexDirection: 'row', gap: 6, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.pill, padding: 4 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  chipActive: { backgroundColor: colors.white },
  chipText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  chipTextActive: { color: colors.ink }
});
