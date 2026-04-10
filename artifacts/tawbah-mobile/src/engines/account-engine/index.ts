import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "tawbah_account_v2";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccentColor = "green" | "blue" | "purple" | "gold" | "rose" | "teal";
export type AppTheme = "light" | "dark" | "system";
export type AppLanguage = "ar" | "en";
export type FontSize = "sm" | "md" | "lg";

export interface AccountSettings {
  displayName: string;
  language: AppLanguage;
  theme: AppTheme;
  accent: AccentColor;
  fontSize: FontSize;
  showStreak: boolean;
  showProgress: boolean;
  shareStats: boolean;
  compactMode: boolean;
  quranFont: "amiri" | "uthmani";
  hapticFeedback: boolean;
  soundEnabled: boolean;
  autoPlayRecitation: boolean;
}

export interface UserStats {
  streakDays: number;
  totalDhikrCount: number;
  journeyDay: number;
  covenantSigned: boolean;
  lastActiveDate: string;
}

export const DEFAULT_SETTINGS: AccountSettings = {
  displayName: "",
  language: "ar",
  theme: "system",
  accent: "green",
  fontSize: "md",
  showStreak: true,
  showProgress: true,
  shareStats: false,
  compactMode: false,
  quranFont: "amiri",
  hapticFeedback: true,
  soundEnabled: true,
  autoPlayRecitation: false,
};

// ─── Persistence ──────────────────────────────────────────────────────────────

export async function loadAccountSettings(): Promise<AccountSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAccountSettings(s: Partial<AccountSettings>): Promise<AccountSettings> {
  try {
    const current = await loadAccountSettings();
    const updated = { ...current, ...s };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ─── Display Helpers ──────────────────────────────────────────────────────────

export const ACCENT_OPTIONS: { id: AccentColor; labelAr: string; color: string }[] = [
  { id: "green",  labelAr: "الغابة الزمردية", color: "#10b981" },
  { id: "blue",   labelAr: "المحيط الهادئ",   color: "#3b82f6" },
  { id: "purple", labelAr: "شفق الليل",       color: "#8b5cf6" },
  { id: "gold",   labelAr: "الذهب الساطع",    color: "#f59e0b" },
  { id: "rose",   labelAr: "وردة الفجر",       color: "#f43f5e" },
  { id: "teal",   labelAr: "الفيروز الصافي",  color: "#14b8a6" },
];

export const THEME_OPTIONS: { id: AppTheme; labelAr: string }[] = [
  { id: "light",  labelAr: "فاتح" },
  { id: "dark",   labelAr: "داكن" },
  { id: "system", labelAr: "تلقائي" },
];

export const FONT_SIZE_OPTIONS: { id: FontSize; labelAr: string; scale: number }[] = [
  { id: "sm", labelAr: "صغير",  scale: 0.85 },
  { id: "md", labelAr: "متوسط", scale: 1.0  },
  { id: "lg", labelAr: "كبير",  scale: 1.18 },
];
