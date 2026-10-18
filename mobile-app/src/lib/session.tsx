// Who is signed in. One sign-in for every role; the role decides which part of the app opens.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import { api, setApiToken, setUnauthorizedHandler } from './api';
import { getItem, removeItem, setItem } from './storage';
import { queryClient } from './query';
import type { SessionUser } from '@/types/catalog';

const KEY = 'easycart.session';

interface SessionState {
  user: SessionUser | null;
  isReady: boolean;
  signIn(user: SessionUser, token: string): Promise<void>;
  updateUser(patch: Partial<SessionUser>): Promise<void>;
  refreshUser(): Promise<void>;
  signOut(): Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const signOut = useCallback(async () => {
    setApiToken(null);
    setUser(null);
    queryClient.clear();
    await removeItem(KEY);
    router.replace('/login');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api<{ user: SessionUser }>('/profile');
      if (res?.user) {
        setUser((curr) => {
          if (!curr) return null;
          const updated = { ...curr, ...res.user };
          getItem(KEY).then((raw) => {
            if (!raw) return;
            const saved = JSON.parse(raw) as { user: SessionUser; token: string };
            void setItem(KEY, JSON.stringify({ ...saved, user: updated }));
          }).catch(() => undefined);
          return updated;
        });
      }
    } catch {
      // offline or unreachable
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    getItem(KEY)
      .then(async (raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { user: SessionUser; token: string };
        setApiToken(saved.token);
        setUser(saved.user);
        // Automatically sync the latest user profile from server so changes made on other devices
        // (avatar_url, username, email, phone) are reflected immediately
        try {
          const res = await api<{ user: SessionUser }>('/profile');
          if (res?.user) {
            const updated = { ...saved.user, ...res.user };
            setUser(updated);
            void setItem(KEY, JSON.stringify({ ...saved, user: updated }));
          }
        } catch {
          // keep cached session if server is offline
        }
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, [signOut]);

  // Sync profile when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshUser();
      }
    });
    return () => sub.remove();
  }, [refreshUser]);

  // Periodic background sync while signed in (every 20s)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      void refreshUser();
    }, 20_000);
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const signIn = useCallback(async (next: SessionUser, token: string) => {
    setApiToken(token);
    setUser(next);
    await setItem(KEY, JSON.stringify({ user: next, token }));
    // Immediately fetch full profile to ensure all fields (including avatar_url) are latest
    try {
      const res = await api<{ user: SessionUser }>('/profile');
      if (res?.user) {
        const full = { ...next, ...res.user };
        setUser(full);
        await setItem(KEY, JSON.stringify({ user: full, token }));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateUser = useCallback(async (patch: Partial<SessionUser>) => {
    setUser((curr) => {
      if (!curr) return null;
      const updated = { ...curr, ...patch };
      getItem(KEY).then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { user: SessionUser; token: string };
        void setItem(KEY, JSON.stringify({ ...saved, user: updated }));
      }).catch(() => undefined);
      return updated;
    });
  }, []);

  const value = useMemo(() => ({ user, isReady, signIn, updateUser, refreshUser, signOut }), [user, isReady, signIn, updateUser, refreshUser, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

// Where each role lands after signing in.
export function homeForRole(role: SessionUser['role']) {
  if (role === 'tenant_owner') return '/owner' as const;
  if (role === 'delivery_partner') return '/rider' as const;
  if (role === 'platform_admin') return '/admin' as const;
  return '/shop' as const;
}
