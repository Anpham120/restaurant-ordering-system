import { env } from '../config/env';
import type { ApiResponse } from '../types/orderTracking';

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    });
    const json = await res.json();
    return json as ApiResponse<T>;
  } catch {
    return { success: false, data: null as T, error: { code: 'NETWORK_ERROR', message: 'Không thể kết nối server.' } };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
