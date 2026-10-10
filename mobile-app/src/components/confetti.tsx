// A short burst of confetti that falls once, for happy moments like a placed order.
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { accents } from '@/theme/theme';

const COLORS = [accents.sky.fg, accents.green.fg, accents.amber.fg, accents.rose.fg, accents.violet.fg, accents.orange.fg];
const PIECES = 32;

function Piece({ index, width, height }: { index: number; width: number; height: number }) {
  const progress = useSharedValue(0);

  // Each piece gets its own start, sideways drift, size and speed from its number, so the burst looks scattered.
  const startX = ((index * 53) % 100) / 100 * width;
  const drift = ((index * 37) % 80) - 40;
  const size = 6 + (index % 4) * 3;
  const turns = index % 2 === 0 ? 1 : -1;

  useEffect(() => {
    progress.value = withDelay((index % 8) * 90, withTiming(1, { duration: 1900 + (index % 5) * 250 }));
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.3,
    transform: [{ translateY: progress.value * height }, { translateX: drift * progress.value }, { rotate: `${progress.value * 540 * turns}deg` }]
  }));

  return <Animated.View style={[styles.piece, { left: startX, width: size, height: size * 1.6, backgroundColor: COLORS[index % COLORS.length] }, style]} />;
}

export function Confetti() {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: PIECES }, (_, index) => <Piece key={index} index={index} width={width} height={height} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: -20, borderRadius: 2 }
});
