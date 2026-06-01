import { env } from '../config/env';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AiManagerReportResponse {
  date: string;
  summary: string;
  sources: string[];
  provider?: string;
  model?: string;
}

async function request<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${env.aiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json() as ApiResponse<T>;
  } catch {
    return {
      success: false,
      data: null as T,
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'Không thể kết nối AI Service.',
      },
    };
  }
}

export const aiService = {
  managerReport: (date: string) =>
    request<AiManagerReportResponse>('/api/v1/ai/manager-report', { date }),
};
