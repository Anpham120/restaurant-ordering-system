import { env } from '../config/env';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AiSuggestedAction {
  label: string;
  items: { id: string; quantity: number; note: string }[];
}

export interface AiChatResponse {
  answer: string;
  sources: string[];
  provider?: string;
  model?: string;
  suggestedAction?: AiSuggestedAction;
}

export interface AiComboResponse extends AiChatResponse {
  numberOfPeople: number;
  budget: number;
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
  menuChat: (question: string, sessionId?: string | null) =>
    request<AiChatResponse>('/api/v1/ai/menu-chat', { question, sessionId }),
  recommendCombo: (params: { numberOfPeople: number; budget: number; preferences: string[] }) =>
    request<AiComboResponse>('/api/v1/ai/recommend-combo', params),
};
