import { createContext } from 'react';
import type { AuthUser, UserRole } from '../types';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
