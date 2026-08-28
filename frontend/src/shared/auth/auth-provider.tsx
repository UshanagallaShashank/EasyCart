// Owns auth state, hydrates from storage, and wires the global 401 handler.
import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from './auth-context';
import { setToken, clearToken } from './token-storage';
import { getStoredUser, setStoredUser, clearStoredUser } from './user-storage';
import { setUnauthorizedHandler } from '@/shared/api/api-client';
import type { User } from '@/features/auth/types/auth-types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function login(nextUser: User, token: string) {
    setToken(token);
    setStoredUser(nextUser);
    setUser(nextUser);
  }

  function logout() {
    clearToken();
    clearStoredUser();
    setUser(null);
    queryClient.clear();
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login');
    });
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
