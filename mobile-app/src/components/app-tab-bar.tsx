// The bottom bar every role uses. It stays on screen on every page: detail pages are hidden tabs
// that light up their parent tab, and a soft highlight slides to whichever tab is active.
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Text } from './text';
import { colors, radius, shadow } from '@/theme/theme';

// Which visible tab to light up while a hidden page is open, e.g. { 'product/[id]': 'index' }.
export type ActiveFor = Record<string, string>;

function TabButton({ label, icon, badge, active, onPress, onLongPress }: {
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  active: boolean;
  onPress(): void;
  onLongPress(): void;
}) {
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withSpring(active ? -2 : 0, { damping: 22, stiffness: 400 });
  }, [active, lift]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }, { scale: 1 + (-lift.value) * 0.06 }] }));

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label}>
      <Animated.View style={iconStyle}>
        {icon}
        {badge !== undefined && badge !== '' && (
          <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
        )}
      </Animated.View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function AppTabBar({ state, descriptors, navigation, insets, activeFor }: BottomTabBarProps & { activeFor?: ActiveFor }) {
  const [width, setWidth] = useState(0);
  const slide = useSharedValue(0);

  // Hidden pages are tabs styled with display:none; they get no button.
  const visible = state.routes.filter((route) => StyleSheet.flatten(descriptors[route.key].options.tabBarItemStyle)?.display !== 'none');
  const focusedName = state.routes[state.index].name;
  const activeName = activeFor?.[focusedName] ?? focusedName;
  const activeIndex = visible.findIndex((route) => route.name === activeName);
  const itemWidth = visible.length > 0 ? width / visible.length : 0;

  useEffect(() => {
    slide.value = withSpring(Math.max(activeIndex, 0) * itemWidth, { damping: 26, stiffness: 380 });
  }, [activeIndex, itemWidth, slide]);

  const highlightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value }] }));

  function press(route: (typeof visible)[number]) {
    if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => undefined);
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
  }

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
      {activeIndex >= 0 && itemWidth > 0 && (
        <Animated.View style={[styles.highlight, { width: itemWidth }, highlightStyle]}>
          <View style={styles.highlightPill} />
        </Animated.View>
      )}
      {visible.map((route) => {
        const { options } = descriptors[route.key];
        const active = route.name === activeName;
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
        const color = active ? colors.primary : colors.textFaint;
        return (
          <TabButton
            key={route.key}
            label={label}
            active={active}
            badge={options.tabBarBadge}
            icon={options.tabBarIcon?.({ focused: active, color, size: 22 })}
            onPress={() => press(route)}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.card, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 8, ...shadow, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08 },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6 },
  highlight: { position: 'absolute', top: 8, left: 0, bottom: 0, alignItems: 'center' },
  highlightPill: { width: 62, height: 52, borderRadius: 18, backgroundColor: colors.primarySoft },
  label: { fontSize: 11, fontWeight: '600', color: colors.textFaint },
  labelActive: { color: colors.primary, fontWeight: '800' },
  badge: { position: 'absolute', top: -6, right: -12, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' }
});
