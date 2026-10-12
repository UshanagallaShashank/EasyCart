// The bottom bar every role uses: a dark floating pill. A bubble in the shop's colours slides to whichever tab
// is active. It stays on screen on every page: detail pages are hidden tabs that light up their parent tab.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Text } from './text';
import { colors } from '@/theme/theme';
import { useBrand } from '@/lib/brand';
import { selectFeedback } from '@/lib/feedback';

// Which visible tab to light up while a hidden page is open, e.g. { 'product/[id]': 'index' }.
export type ActiveFor = Record<string, string>;

const BAR_HEIGHT = 64;
const BUBBLE_INSET = 6;
const ICON_ON = colors.white;
const ICON_OFF = 'rgba(255,255,255,0.55)';

function TabButton({ label, icon, badge, active, onPress, onLongPress }: {
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  active: boolean;
  onPress(): void;
  onLongPress(): void;
}) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.item} accessibilityRole="tab" accessibilityState={{ selected: active }} aria-selected={active} accessibilityLabel={label}>
      <View>
        {icon}
        {badge !== undefined && badge !== '' && (
          <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
        )}
      </View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export function AppTabBar({ state, descriptors, navigation, insets, activeFor }: BottomTabBarProps & { activeFor?: ActiveFor }) {
  const [width, setWidth] = useState(0);
  const brand = useBrand();
  const slide = useSharedValue(0);

  // Hidden pages are tabs styled with display:none; they get no button.
  const visible = state.routes.filter((route) => StyleSheet.flatten(descriptors[route.key].options.tabBarItemStyle)?.display !== 'none');
  const focusedName = state.routes[state.index].name;
  const activeName = activeFor?.[focusedName] ?? focusedName;
  const activeIndex = visible.findIndex((route) => route.name === activeName);
  const itemWidth = visible.length > 0 ? width / visible.length : 0;

  useEffect(() => {
    slide.value = withSpring(Math.max(activeIndex, 0) * itemWidth, { damping: 24, stiffness: 320, overshootClamping: true });
  }, [activeIndex, itemWidth, slide]);

  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value }] }));

  function press(route: (typeof visible)[number]) {
    selectFeedback();
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
  }

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width - BUBBLE_INSET * 2)}>
        {activeIndex >= 0 && itemWidth > 0 && (
          <Animated.View style={[styles.bubbleWrap, { width: itemWidth }, bubbleStyle]}>
            <LinearGradient colors={[brand.mesh[1], brand.mesh[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bubble} />
          </Animated.View>
        )}
        {visible.map((route) => {
          const { options } = descriptors[route.key];
          const active = route.name === activeName;
          const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
          return (
            <TabButton
              key={route.key}
              label={label}
              active={active}
              badge={options.tabBarBadge}
              icon={options.tabBarIcon?.({ focused: active, color: active ? ICON_ON : ICON_OFF, size: 22 })}
              onPress={() => press(route)}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 8 },
  bar: { flexDirection: 'row', width: '100%', maxWidth: 560, alignSelf: 'center', height: BAR_HEIGHT, paddingHorizontal: BUBBLE_INSET, borderRadius: 999, backgroundColor: colors.ink, shadowColor: colors.ink, shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  bubbleWrap: { position: 'absolute', top: BUBBLE_INSET, bottom: BUBBLE_INSET, left: BUBBLE_INSET, paddingHorizontal: 3 },
  bubble: { flex: 1, borderRadius: 999 },
  label: { fontSize: 10, fontWeight: '600', color: ICON_OFF },
  labelActive: { color: ICON_ON, fontWeight: '800' },
  badge: { position: 'absolute', top: -6, right: -12, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.ink },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' }
});
