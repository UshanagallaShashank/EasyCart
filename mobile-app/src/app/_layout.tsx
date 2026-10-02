// App root: data cache, sign-in session, toasts, and the top-level stack of areas.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query';
import { SessionProvider } from '@/lib/session';
import { ToastProvider } from '@/components/toast';
import { stackOptions } from '@/components/nav';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ ...stackOptions, headerShown: false }} />
          </ToastProvider>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
