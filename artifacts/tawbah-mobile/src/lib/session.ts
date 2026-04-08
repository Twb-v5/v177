import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SESSION_KEY = "tawbah_session_id";
let _sessionId: string | null = null;

function generateSessionId(): string {
  const rand = () => Math.random().toString(36).substring(2, 9);
  return `${Platform.OS}-${rand()}-${rand()}-${Date.now()}`;
}

export async function initSession(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(SESSION_KEY);
    if (stored) {
      _sessionId = stored;
      return stored;
    }
  } catch {}
  const id = generateSessionId();
  _sessionId = id;
  try {
    await AsyncStorage.setItem(SESSION_KEY, id);
  } catch {}
  return id;
}

export function getSessionId(): string {
  if (_sessionId) return _sessionId;
  const id = generateSessionId();
  _sessionId = id;
  AsyncStorage.setItem(SESSION_KEY, id).catch(() => {});
  return id;
}

export async function clearSession(): Promise<void> {
  _sessionId = null;
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {}
}
