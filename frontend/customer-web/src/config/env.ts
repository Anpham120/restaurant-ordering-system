const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? 'http://localhost:5030').replace(/\/$/, '');

export const env = {
  apiBaseUrl,
  hubUrl: `${apiBaseUrl}/hubs/restaurant`,
} as const;
