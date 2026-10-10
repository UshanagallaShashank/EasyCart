// Three big buttons to switch language. Each shows its own name, so people can find theirs without reading English.
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from './text';
import { PressScale } from './motion';
import { LANGUAGES, useLanguage } from '@/lib/i18n';
import { colors, radius, space } from '@/theme/theme';

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.row}>
      {LANGUAGES.map((option) => {
        const active = option.code === language;
        return (
          <PressScale
            key={option.code}
            onPress={() => { void Haptics.selectionAsync().catch(() => undefined); setLanguage(option.code); }}
            style={[styles.option, active && styles.optionActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  option: { flex: 1, height: 48, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  label: { fontSize: 16, fontWeight: '700', color: colors.textSoft },
  labelActive: { color: colors.primaryDark }
});
