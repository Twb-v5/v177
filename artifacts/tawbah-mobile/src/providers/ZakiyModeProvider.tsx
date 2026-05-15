import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ZakiyDecision {
  message: string;
  urgency: "normal" | "high" | "emergency";
  action?: string;
}

interface ZakiyModeContextType {
  aiMode: boolean;
  toggleAiMode: () => void;
  setAiMode: (mode: boolean) => void;
  decision: ZakiyDecision | null;
  setDecision: (d: ZakiyDecision | null) => void;
}

const ZAKIY_MODE_KEY = "zakiy_mode";

const ZakiyModeContext = createContext<ZakiyModeContextType | undefined>(undefined);

export function ZakiyModeProvider({ children }: { children: ReactNode }) {
  const [aiMode, setAiModeState] = useState(false);
  const [decision, setDecision] = useState<ZakiyDecision | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const stored = await AsyncStorage.getItem(ZAKIY_MODE_KEY);
        if (stored) setAiModeState(JSON.parse(stored));
      } catch {}
    }
    load();
  }, []);

  const setAiMode = useCallback((mode: boolean) => {
    setAiModeState(mode);
    AsyncStorage.setItem(ZAKIY_MODE_KEY, JSON.stringify(mode)).catch(() => {});
  }, []);

  const toggleAiMode = useCallback(() => {
    setAiModeState((prev) => {
      const next = !prev;
      AsyncStorage.setItem(ZAKIY_MODE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <ZakiyModeContext.Provider value={{ aiMode, toggleAiMode, setAiMode, decision, setDecision }}>
      {children}
    </ZakiyModeContext.Provider>
  );
}

export function useZakiyMode() {
  const ctx = useContext(ZakiyModeContext);
  if (!ctx) throw new Error("useZakiyMode must be used within ZakiyModeProvider");
  return ctx;
}
