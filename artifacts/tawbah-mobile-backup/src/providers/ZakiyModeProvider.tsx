import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

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

const ZakiyModeContext = createContext<ZakiyModeContextType | undefined>(undefined);

export function ZakiyModeProvider({ children }: { children: ReactNode }) {
  const [aiMode, setAiMode] = useState(false);
  const [decision, setDecision] = useState<ZakiyDecision | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zakiy_mode");
      if (stored) setAiMode(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleAiMode = useCallback(() => {
    setAiMode((prev) => {
      const next = !prev;
      try { localStorage.setItem("zakiy_mode", JSON.stringify(next)); } catch {}
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
