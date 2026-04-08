import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";

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

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("system");
  const [accentColor, setAccentColor] = useState<AccentColor>("green");
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  const resolvedTheme = theme === "system" 
    ? (systemColorScheme === "dark" ? "dark" : "light")
    : theme;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {}
  }, []);

  const persist = (updates: Partial<Settings>) => {
    try {
      const current = { theme, accentColor, language };
      localStorage.setItem("settings", JSON.stringify({ ...current, ...updates }));
    } catch {}
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        accentColor,
        language,
        resolvedTheme,
        setTheme: (t) => { setTheme(t); persist({ theme: t }); },
        setAccentColor: (c) => { setAccentColor(c); persist({ accentColor: c }); },
        setLanguage: (l) => { setLanguage(l); persist({ language: l }); },
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
