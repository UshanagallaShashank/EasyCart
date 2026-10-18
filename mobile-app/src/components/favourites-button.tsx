import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/icon';
import { accents, colors } from '@/theme/theme';

interface FavouritesButtonProps {
  active?: boolean;
  onPress?: () => void;
}

export function FavouritesButton({ active = false, onPress }: FavouritesButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/shop/favourites');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel="Favourites"
      accessibilityRole="button"
      hitSlop={8}
      style={[styles.button, active && styles.buttonActive]}
    >
      <Icon
        name="heart"
        size={19}
        color={active ? accents.rose.fg : colors.text}
        fill={active ? accents.rose.fg : 'none'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonActive: {
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2'
  }
});
