// Small animation helpers every screen can reuse: press squish, fade-in, and loading skeletons.
import { useEffect, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn as FadeInEffect, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A button-like wrapper that shrinks a little while pressed, then springs back.
export function PressScale({ children, style, ...props }: PressableProps & { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 20, stiffness: 400 });
        props.onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

// A quick fade-in (no sliding). Give list items a bigger `index` for a very small stagger.
export function FadeIn({ children, index = 0, style }: { children: ReactNode; index?: number; style?: StyleProp<ViewStyle> }) {
  const delay = Math.min(index, 4) * 25; // at most 100ms, so lists never feel slow
  return (
    <Animated.View entering={FadeInEffect.delay(delay).duration(180)} style={style}>
      {children}
    </Animated.View>
  );
}

// A grey pulsing block that stands in for content while it loads.
export function Skeleton({ width = '100%', height = 16, rounded = radius.sm }: { width?: number | `${number}%`; height?: number; rounded?: number }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width, height, borderRadius: rounded, backgroundColor: colors.border }, animatedStyle]} />;
}
