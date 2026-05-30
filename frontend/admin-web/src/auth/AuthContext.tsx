import React, { createContext, useCallback, useEffect, useState } from 'react';
import { tokenStorage } from '../lib/apiClient';
import { authService } from '../services/authService';
import type { AuthUser, UserRole } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: tokenStorage.get(),
    isLoading: true,
  });

  const logout = useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, token: null, isLoading: false });
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }
    authService.me().then(res => {
      if (res.success) {
        setState({ user: res.data, token, isLoading: false });
      } else {
        logout();
      }
    });
  }, [logout]);

  // Listen for 401 events from apiClient
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await authService.login(email, password);
    if (!res.success) return res.error.message;

    tokenStorage.set(res.data.accessToken);
    setState({ user: res.data.user, token: res.data.accessToken, isLoading: false });
    return null;
  }, []);

  const hasRole = useCallback((...roles: UserRole[]) =>
    state.user !== null && roles.includes(state.user.role), [state.user]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
