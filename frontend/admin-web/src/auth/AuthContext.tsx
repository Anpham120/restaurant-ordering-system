import React, { useCallback, useEffect, useState } from 'react';
import { tokenStorage } from '../lib/apiClient';
import { authService } from '../services/authService';
import type { UserRole } from '../types';
import { AuthContext, type AuthState } from './authContextValue';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = tokenStorage.get();
    return {
      user: null,
      token,
      isLoading: Boolean(token),
    };
  });

  const logout = useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, token: null, isLoading: false });
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
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
