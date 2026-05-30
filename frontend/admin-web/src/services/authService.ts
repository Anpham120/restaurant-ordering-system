import { api } from '../lib/apiClient';
import type { AuthUser, LoginResponse } from '../types';

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/v1/auth/login', { email, password }),

  me: () =>
    api.get<AuthUser>('/api/v1/auth/me'),
};
