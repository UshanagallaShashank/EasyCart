// The round heart that saves a product to the customer's favourites (kept on the phone).
import { StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from '@/components/icon';
import { PressScale } from '@/components/motion';
import { accents, colors } from '@/theme/theme';
import { useShop } from './shop-context';

export function FavouriteButton({ productId, size = 32 }: { productId: string; size?: number }) {
  const { favourites, toggleFavourite } = useShop();
  const saved = favourites.includes(productId);

  function press() {
    void Haptics.selectionAsync().catch(() => undefined);
    toggleFavourite(productId);
  }

  return (
    <PressScale onPress={press} hitSlop={8} style={[styles.button, { width: size, height: size, borderRadius: size / 2 }]} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from favourites' : 'Save to favourites'}>
      <Icon name="heart" size={size * 0.55} color={saved ? accents.rose.fg : colors.textFaint} fill={saved ? accents.rose.fg : 'none'} />
    </PressScale>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }
});
