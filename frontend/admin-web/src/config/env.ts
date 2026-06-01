const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? 'http://localhost:5030').replace(/\/$/, '');
const aiBaseUrl = (import.meta.env.VITE_AI_BASE_URL as string | undefined ?? 'http://localhost:8000').replace(/\/$/, '');

export const env = {
  apiBaseUrl,
  aiBaseUrl,
  hubUrl: import.meta.env.VITE_RESTAURANT_HUB_URL as string | undefined
    ?? `${apiBaseUrl}/hubs/restaurant`,
} as const;
