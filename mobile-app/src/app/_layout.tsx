// App root: the app's font, data cache (optionally kept on the phone), sign-in session, toasts,
// the offline banner, and the top-level stack of areas.
import { useEffect, type ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '@/lib/query';
import { createLocalCache } from '@/lib/local-cache';
import { catchCrashes } from '@/lib/remote-log';
import { SessionProvider } from '@/lib/session';
import { ToastProvider } from '@/components/toast';
import { ConfirmProvider } from '@/components/confirm';
import { ConnectionBanner } from '@/components/connection-banner';
import { LanguageProvider } from '@/lib/i18n';
import { stackOptions } from '@/components/nav';

void SplashScreen.preventAutoHideAsync();
catchCrashes();

const localCache = createLocalCache();
const DAY_MS = 24 * 60 * 60 * 1000;

function DataCache({ children }: { children: ReactNode }) {
  if (!localCache) return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  return <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: localCache, maxAge: DAY_MS, buster: 'v1' }}>{children}</PersistQueryClientProvider>;
}

export default function RootLayout() {
  const [loaded, failed] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });
  const ready = loaded || Boolean(failed);
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <LanguageProvider>
      <DataCache>
        <SessionProvider>
          <ToastProvider>
            <ConfirmProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ ...stackOptions, headerShown: false }} />
              <ConnectionBanner />
            </ConfirmProvider>
          </ToastProvider>
        </SessionProvider>
      </DataCache>
      </LanguageProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
