// Five tappable stars. Pass `onChange` to let people choose; leave it out to just show a rating.
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from './icon';
import { PressScale } from './motion';
import { accents, colors } from '@/theme/theme';

export function StarRating({ value, onChange, size = 30 }: { value: number; onChange?(stars: number): void; size?: number }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = <Icon name="star" size={size} color={filled ? accents.amber.fg : colors.border} fill={filled ? accents.amber.fg : 'none'} />;
        if (!onChange) return <View key={star}>{icon}</View>;
        return (
          <PressScale
            key={star}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${star} ${star === 1 ? 'star' : 'stars'}`}
            onPress={() => { void Haptics.selectionAsync().catch(() => undefined); onChange(star); }}
          >
            {icon}
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' }
});
