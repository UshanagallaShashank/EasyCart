// What a product shows when the shop has not added a photo: a soft gradient tile with the product's initials.
// The colour comes from the name, so the same product always looks the same and a list never looks all grey.
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './text';
import { accentAt, colors } from '@/theme/theme';

function colourIndex(name: string) {
  let total = 0;
  for (const letter of name) total += letter.charCodeAt(0);
  return total;
}

// "Alphonso Mangoes 1kg" becomes "AM"; a one-word name gives its first letter.
function initials(name: string) {
  // Words starting with a number ("1kg", "500g") are sizes, not names, so they are skipped.
  const words = name.trim().split(' ').filter((word) => word !== '' && !'0123456789'.includes(word[0]));
  if (words.length === 0) return name.trim().slice(0, 1).toUpperCase() || '?';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

export function ProductPlaceholder({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const accent = accentAt(colourIndex(name));
  const fontSize = size === 'sm' ? 16 : size === 'lg' ? 56 : 30;
  return (
    <View style={StyleSheet.absoluteFill} accessibilityLabel={`${name}, no photo`}>
      <LinearGradient colors={[accent.bg, colors.white]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.center]}>
        <View style={[styles.glow, { backgroundColor: accent.grad[0] }]} />
        <Text style={{ fontSize, fontWeight: '900', color: accent.fg, letterSpacing: -1, opacity: 0.85 }}>{initials(name)}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', right: '-20%', top: '-20%', width: '70%', aspectRatio: 1, borderRadius: 999, opacity: 0.18 }
});
