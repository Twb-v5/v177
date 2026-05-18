import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { MIRACLES } from "./quranData";

export function MiraclesSection() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const { theme } = useSettings();
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-3">
      {MIRACLES.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-xl overflow-hidden cursor-pointer"
          style={{
            background: `linear-gradient(145deg, ${m.color})`,
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          }}
          onClick={() => setExpanded(expanded === m.id ? null : m.id)}
        >
          <div className="flex items-center gap-3 p-3.5">
            <span className="text-[22px] shrink-0">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
                  }}
                >
                  {m.category}
                </span>
              </div>
              <p className="font-bold text-sm leading-tight">{m.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{m.description}</p>
            </div>
            <motion.div animate={{ rotate: expanded === m.id ? 180 : 0 }}>
              <ChevronDown size={16} className="text-muted-foreground shrink-0" />
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded === m.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className="mx-3 mb-3 p-3 rounded-xl"
                  style={{
                    background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
                    border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <p className="text-[12px] leading-loose text-right text-foreground/80">{m.detail}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
