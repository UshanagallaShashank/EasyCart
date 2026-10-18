// The bottom bar every role uses. Floating dark pill matching reference design with vibrant blue active pill.
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Text } from './text';
import { colors, radius, shadow } from '@/theme/theme';
import { useBrand } from '@/lib/brand';

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

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }, { scale: 1 + (-lift.value) * 0.05 }] }));

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
  const brand = useBrand();
  const [width, setWidth] = useState(0);
  const slide = useSharedValue(0);

  const focusedName = state.routes[state.index].name;
  const focusedOptions = descriptors[state.routes[state.index].key]?.options;
  const isHidden = focusedName === 'product/[id]' || (focusedOptions?.tabBarStyle as any)?.display === 'none';

  // Hidden pages are tabs styled with display:none; they get no button.
  const visible = state.routes.filter((route) => (descriptors[route.key].options.tabBarItemStyle as any)?.display !== 'none');
  const activeName = activeFor?.[focusedName] ?? focusedName;
  const activeIndex = visible.findIndex((route) => route.name === activeName);
  const itemWidth = visible.length > 0 ? (width - 12) / visible.length : 0;

  useEffect(() => {
    if (!isHidden) {
      slide.value = withSpring(Math.max(activeIndex, 0) * itemWidth, { damping: 26, stiffness: 380 });
    }
  }, [activeIndex, itemWidth, slide, isHidden]);

  const highlightStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slide.value }] }));

  if (isHidden) {
    return null;
  }

  function press(route: (typeof visible)[number]) {
    if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => undefined);
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
  }

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom + 4, 16) }]} pointerEvents="box-none">
      <View style={styles.bar} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}>
        {activeIndex >= 0 && itemWidth > 0 && (
          <Animated.View style={[styles.highlight, { width: itemWidth, left: 6 }, highlightStyle]}>
            <View style={[styles.highlightPill, { backgroundColor: brand.primary }]} />
          </Animated.View>
        )}
        {visible.map((route) => {
          const { options } = descriptors[route.key];
          const active = route.name === activeName;
          const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
          const color = active ? '#ffffff' : '#94a3b8';
          return (
            <TabButton
              key={route.key}
              label={label}
              active={active}
              badge={options.tabBarBadge}
              icon={options.tabBarIcon?.({ focused: active, color, size: 21 })}
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
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 90
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#0b1329',
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    width: '100%',
    maxWidth: 500,
    minHeight: 64,
    alignItems: 'center'
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 5,
    zIndex: 2
  },
  highlight: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  highlightPill: {
    width: '88%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#0284c7'
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: -0.1
  },
  labelActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 8.5,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0b1329'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800'
  }
});

