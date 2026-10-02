// Who is signed in. One sign-in for every role; the role decides which part of the app opens.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { router } from 'expo-router';
import { setApiToken, setUnauthorizedHandler } from './api';
import { getItem, removeItem, setItem } from './storage';
import { queryClient } from './query';
import type { SessionUser } from '@/types/catalog';

const KEY = 'easycart.session';

interface SessionState {
  user: SessionUser | null;
  isReady: boolean;
  signIn(user: SessionUser, token: string): Promise<void>;
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

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { user: SessionUser; token: string };
        setApiToken(saved.token);
        setUser(saved.user);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, [signOut]);

  const signIn = useCallback(async (next: SessionUser, token: string) => {
    setApiToken(token);
    setUser(next);
    await setItem(KEY, JSON.stringify({ user: next, token }));
  }, []);

  const value = useMemo(() => ({ user, isReady, signIn, signOut }), [user, isReady, signIn, signOut]);
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
