import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const PRODUCTION_API = "https://tawbah.replit.app/api";

function detectDevApiBase(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return PRODUCTION_API;
}

const DEFAULT_API_BASE = __DEV__ ? detectDevApiBase() : PRODUCTION_API;

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
