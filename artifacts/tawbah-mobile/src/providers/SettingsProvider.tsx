import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";
type AccentColor = "green" | "blue" | "purple" | "gold";

interface Settings {
  theme: Theme;
  accentColor: AccentColor;
  language: "ar" | "en";
}

interface SettingsContextType extends Settings {
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setLanguage: (lang: "ar" | "en") => void;
}

const ACCENT_COLORS: Record<AccentColor, { lightPrimary: string; darkPrimary: string }> = {
  green: { lightPrimary: "#174d2b", darkPrimary: "#10551b" },
  blue: { lightPrimary: "#1e40af", darkPrimary: "#1d4ed8" },
  purple: { lightPrimary: "#581c87", darkPrimary: "#7e22ce" },
  gold: { lightPrimary: "#854d0e", darkPrimary: "#a16207" },
};

const SETTINGS_KEY = "tawbah_settings";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");
  const [accentColor, setAccentColorState] = useState<AccentColor>("green");
  const [language, setLanguageState] = useState<"ar" | "en">("ar");
  const [loaded, setLoaded] = useState(false);

  const resolvedTheme = theme === "system"
    ? (systemColorScheme === "dark" ? "dark" : "light")
    : theme;

  useEffect(() => {
    async function loadSettings() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.theme) setThemeState(parsed.theme);
          if (parsed.accentColor) setAccentColorState(parsed.accentColor);
          if (parsed.language) setLanguageState(parsed.language);
        }
      } catch {}
      setLoaded(true);
    }
    loadSettings();
  }, []);

  const persist = async (updates: Partial<Settings>) => {
    try {
      const current = { theme, accentColor, language };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
    } catch {}
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    persist({ theme: t });
  };

  const setAccentColor = (c: AccentColor) => {
    setAccentColorState(c);
    persist({ accentColor: c });
  };

  const setLanguage = (l: "ar" | "en") => {
    setLanguageState(l);
    persist({ language: l });
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        accentColor,
        language,
        resolvedTheme,
        setTheme,
        setAccentColor,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export { ACCENT_COLORS };
export type { AccentColor };
