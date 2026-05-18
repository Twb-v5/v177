import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Surah, SURAHS } from "./quranData";

export function SurahBrowser({ onSelect }: { onSelect: (s: Surah) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"الكل" | "مكية" | "مدنية">("الكل");
  const [expanded, setExpanded] = useState(false);

  const filtered = SURAHS.filter((s) => {
    const matchFilter = filter === "الكل" || s.revelation === filter;
    const matchQuery =
      !query ||
      s.name.includes(query) ||
      s.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      s.meaning.includes(query);
    return matchFilter && matchQuery;
  });

  const displayed = expanded ? filtered : filtered.slice(0, 12);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setExpanded(true); }}
            placeholder="ابحث عن سورة..."
            className="w-full h-9 pr-9 pl-3 rounded-xl text-sm bg-card border border-border/60 focus:outline-none focus:border-primary/50 text-right"
            dir="rtl"
          />
        </div>
        <div className="flex gap-1">
          {(["الكل", "مكية", "مدنية"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: filter === f ? "rgba(200,168,75,0.2)" : "rgba(255,255,255,0.05)",
                color: filter === f ? "#c8a84b" : "rgba(255,255,255,0.5)",
                border: filter === f ? "1px solid rgba(200,168,75,0.35)" : "1px solid transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {displayed.map((surah, i) => (
            <motion.div
              key={surah.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <button
                onClick={() => onSelect(surah)}
                className="w-full text-right flex flex-col gap-1 p-3 rounded-xl border border-border/40 bg-card hover:border-amber-400/40 active:scale-[0.97] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "rgba(200,168,75,0.15)", color: "#c8a84b" }}
                  >
                    {surah.id}
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                    style={{
                      background: surah.revelation === "مكية" ? "rgba(139,92,246,0.15)" : "rgba(16,185,129,0.15)",
                      color: surah.revelation === "مكية" ? "#7c3aed" : "#059669",
                    }}
                  >
                    {surah.revelation}
                  </span>
                </div>
                <p className="font-bold text-sm leading-tight">{surah.name}</p>
                <p className="text-[10px] text-muted-foreground">{surah.ayahCount} آية · ج{surah.juz}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Play size={9} style={{ color: "#c8a84b" }} />
                  <span className="text-[9px]" style={{ color: "rgba(200,168,75,0.6)" }}>استمع وتلاوة</span>
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length > 8 && (
        <button
          onClick={() => setExpanded((s) => !s)}
          className="w-full mt-3 py-2.5 rounded-xl text-[12px] font-bold transition-colors flex items-center justify-center gap-2"
          style={{ background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.2)", color: "#c8a84b" }}
        >
          {expanded ? (
            <><ChevronUp size={14} /><span>عرض أقل</span></>
          ) : (
            <><ChevronDown size={14} /><span>عرض كل السور ({filtered.length})</span></>
          )}
        </button>
      )}
    </div>
  );
}
