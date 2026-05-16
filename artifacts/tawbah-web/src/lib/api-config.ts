// ── API server URL (used by native Capacitor APK only) ────────────────────────
//
// In the browser the Vite dev-server proxies /api → localhost:3001, so we
// never need an absolute URL there.
//
// For the Android APK (Capacitor) we need a real HTTPS URL because
// window.location.origin resolves to "https://localhost" inside the WebView,
// not the actual server.
//
// Priority (native only):
//   1. VITE_API_BASE_URL  — baked in at build time by build-web-apk.sh
//   2. localStorage "tawbah_api_base" — user-configurable at runtime
//   3. Hardcoded production URL
// ─────────────────────────────────────────────────────────────────────────────

const BAKED_URL: string | undefined = import.meta.env.VITE_API_BASE_URL as string | undefined;

// Production deployment URL — update if domain changes
const FALLBACK_SERVER = "https://v-177--hadystow.replit.app";

function resolveServerBase(): string {
  if (BAKED_URL && BAKED_URL.startsWith("http")) return BAKED_URL.replace(/\/+$/, "");
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("tawbah_api_base");
    if (stored && stored.startsWith("http")) return stored.replace(/\/+$/, "");
  }
  return FALLBACK_SERVER;
}

const serverBase = resolveServerBase();

export const API_CONFIG = {
  serverUrl: `${serverBase}/api`,
  zakiyApiBaseUrl: `${serverBase}/api`,
} as const;

export type ApiConfig = typeof API_CONFIG;
