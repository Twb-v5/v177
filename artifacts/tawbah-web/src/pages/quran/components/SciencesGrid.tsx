import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import { SCIENCES } from "./quranData";

export function SciencesGrid() {
  const hasRoute = (route: string) => ["/quran/tafsir", "/quran/miracles"].includes(route);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {SCIENCES.map((s, i) => {
        const active = hasRoute(s.route);
        const inner = (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl p-4 bg-gradient-to-br ${s.gradient} border ${s.border} active:scale-[0.96] transition-all cursor-pointer`}
          >
            <span className="text-[24px] mb-2 block">{s.icon}</span>
            <p className="font-bold text-sm leading-tight mb-1">{s.title}</p>
            <p className="text-[10px] text-muted-foreground leading-snug">{s.description}</p>
            <div className="flex items-center gap-1 mt-2">
              {active ? (
                <span className="text-[9px] font-bold" style={{ color: "#22c55e" }}>مفعّل ✓</span>
              ) : (
                <>
                  <span className="text-[9px] font-bold text-foreground/35">قريباً</span>
                  <Sparkles size={9} className="text-foreground/30" />
                </>
              )}
            </div>
          </motion.div>
        );
        return active ? (
          <Link key={s.id} href={s.route}>{inner}</Link>
        ) : (
          <div key={s.id}>{inner}</div>
        );
      })}
    </div>
  );
}
