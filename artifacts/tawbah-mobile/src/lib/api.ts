import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_API_BASE = "https://tawbah.replit.app/api";

let _apiBase: string | null = null;

export async function initApiBase(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem("tawbah_api_base");
    _apiBase = stored ?? DEFAULT_API_BASE;
  } catch {
    _apiBase = DEFAULT_API_BASE;
  }
}

export function getApiBase(): string {
  return _apiBase ?? DEFAULT_API_BASE;
}

export function apiUrl(path: string): string {
  const base = getApiBase().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : "/" + path;
  return base + p;
}

export function aiUrl(path: string): string {
  return apiUrl(path);
}

export async function setApiBase(url: string): Promise<void> {
  _apiBase = url;
  try {
    await AsyncStorage.setItem("tawbah_api_base", url);
  } catch {}
}
