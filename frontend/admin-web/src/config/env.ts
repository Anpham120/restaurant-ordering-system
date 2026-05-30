const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? 'http://localhost:5030').replace(/\/$/, '');

export const env = {
  apiBaseUrl,
  hubUrl: import.meta.env.VITE_RESTAURANT_HUB_URL as string | undefined
    ?? `${apiBaseUrl}/hubs/restaurant`,
} as const;
