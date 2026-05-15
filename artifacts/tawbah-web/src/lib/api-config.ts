const replitDev = typeof window !== "undefined"
  ? window.location.origin
  : "https://tawbah.replit.app";

export const API_CONFIG = {
  zakiyApiBaseUrl: `${replitDev}/api`,
  serverUrl: `${replitDev}/api/`,
} as const;

export type ApiConfig = typeof API_CONFIG;
