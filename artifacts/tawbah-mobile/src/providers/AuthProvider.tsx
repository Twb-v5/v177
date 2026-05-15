import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "@/lib/api";

const TOKEN_KEY = "tawbah_auth_token";
const USER_KEY = "tawbah_auth_user";

export interface AuthUser {
  id: number | string;
  username: string;
  email: string;
  gender?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string, gender?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function apiFetch(path: string, opts?: RequestInit, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts?.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(apiUrl(path), { ...opts, headers });
  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistAuth = async (u: AuthUser, t: string) => {
    setUser(u);
    setToken(t);
    await AsyncStorage.setItem(TOKEN_KEY, t);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const clearAuth = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  const refetch = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (!storedToken) { setLoading(false); return; }
      const res = await apiFetch("/auth/me", {}, storedToken);
      if (res.ok) {
        const data = await res.json() as { user: AuthUser | null };
        if (data.user) { setUser(data.user); setToken(storedToken); }
        else await clearAuth();
      } else {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedUser) { setUser(JSON.parse(storedUser) as AuthUser); setToken(storedToken); }
        else await clearAuth();
      }
    } catch {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(TOKEN_KEY),
      ]);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser) as AuthUser);
        setToken(storedToken);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const signIn = async (username: string, password: string) => {
    const res = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
    const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
    if (!res.ok) {
      const msg: Record<string, string> = {
        invalid_credentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
        username_required: "أدخل اسم المستخدم",
        password_required: "أدخل كلمة المرور",
      };
      throw new Error(msg[data.error ?? ""] ?? "خطأ في تسجيل الدخول");
    }
    if (data.token && data.user) await persistAuth(data.user, data.token);
  };

  const signUp = async (username: string, email: string, password: string, gender = "male") => {
    const res = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ username, email, password, gender }) });
    const data = await res.json() as { token?: string; user?: AuthUser; error?: string };
    if (!res.ok) {
      const msg: Record<string, string> = {
        email_taken: "البريد الإلكتروني مستخدم بالفعل",
        username_taken: "اسم المستخدم مستخدم بالفعل",
        email_required: "أدخل بريداً إلكترونياً صحيحاً",
        username_required: "أدخل اسم مستخدم",
        password_min_6: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        username_invalid_chars: "اسم المستخدم: أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
      };
      throw new Error(msg[data.error ?? ""] ?? "خطأ في إنشاء الحساب");
    }
    if (data.token && data.user) await persistAuth(data.user, data.token);
  };

  const signOut = async () => {
    try {
      const t = await AsyncStorage.getItem(TOKEN_KEY);
      await apiFetch("/auth/logout", { method: "POST" }, t);
    } catch {}
    await clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export async function getStoredToken(): Promise<string | null> {
  try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
}
