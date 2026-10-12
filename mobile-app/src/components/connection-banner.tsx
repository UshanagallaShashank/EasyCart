// A small banner above the tab bar while the phone is offline or the server is not answering, with a live
// "away for 0:42" counter and a Retry button. When the server answers again it says so and refreshes every screen.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNetworkState } from 'expo-network';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Text } from './text';
import { Icon } from './icon';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/query';
import { formatDuration, useConnection } from '@/lib/connection';
import { successFeedback } from '@/lib/feedback';
import { colors, glow } from '@/theme/theme';

const CHECK_EVERY_MS = 5_000;
const SHOW_BACK_FOR_MS = 4_000;

function checkServer() {
  void api('/health').catch(() => undefined);
}

// Re-draws once a second while `on` is true, so the counter moves.
function useTick(on: boolean) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!on) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [on]);
  return now;
}

export function ConnectionBanner() {
  const insets = useSafeAreaInsets();
  const network = useNetworkState();
  const { downSince, lastOutage } = useConnection();
  const phoneOffline = network.isConnected === false || network.isInternetReachable === false;
  const away = downSince !== null || phoneOffline;
  const now = useTick(away);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    if (downSince === null) return;
    const timer = setInterval(checkServer, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [downSince]);

  useEffect(() => {
    if (!lastOutage) return;
    successFeedback();
    void queryClient.invalidateQueries();
    setShowBack(true);
    const timer = setTimeout(() => setShowBack(false), SHOW_BACK_FOR_MS);
    return () => clearTimeout(timer);
  }, [lastOutage]);

  if (!away && !showBack) return null;
  const bottom = insets.bottom + 104;
  if (!away && lastOutage) {
    return (
      <Animated.View entering={FadeInDown} exiting={FadeOutDown} pointerEvents="none" style={[styles.wrap, { bottom }]} testID="connection-back">
        <LinearGradient colors={['#059669', '#14b8a6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.banner, glow('#059669')]}>
          <Icon name="check" size={16} color={colors.white} strokeWidth={3} />
          <Text style={styles.title}>Back online</Text>
          <Text style={styles.time}>away {formatDuration(lastOutage.endedAt - lastOutage.startedAt)}</Text>
        </LinearGradient>
      </Animated.View>
    );
  }
  const since = downSince ?? now;
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} pointerEvents="box-none" style={[styles.wrap, { bottom }]} testID="connection-away">
      <LinearGradient colors={['#be123c', '#ea580c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.banner, glow('#e11d48')]}>
        <Icon name="wifi-off" size={16} color={colors.white} />
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.title}>{phoneOffline ? 'You are offline' : 'Server not answering'}</Text>
          <Text style={styles.time} testID="connection-counter">away {formatDuration(now - since)}</Text>
        </View>
        <Pressable onPress={checkServer} hitSlop={8} accessibilityRole="button" style={styles.retry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, maxWidth: 440 },
  title: { color: colors.white, fontSize: 13, fontWeight: '800' },
  time: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  retry: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 4 },
  retryText: { color: colors.white, fontSize: 12, fontWeight: '800' }
});
