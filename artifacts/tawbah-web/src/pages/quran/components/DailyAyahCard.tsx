import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Bookmark, Share2, BookOpen, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { DAILY_AYAHS } from "./quranData";

export function DailyAyahCard() {
  const todayIdx = new Date().getDate() % DAILY_AYAHS.length;
  const ayah = DAILY_AYAHS[todayIdx]!;
  const [showTafsir, setShowTafsir] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="rounded-[22px] overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.04) 100%)",
        border: "1px solid rgba(16,185,129,0.25)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Sun size={13} className="text-emerald-500" />
          </div>
          <span className="text-xs font-bold text-emerald-600">آية اليوم</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSaved((s) => !s)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: saved ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.05)" }}
          >
            <Bookmark size={13} className={saved ? "text-emerald-500" : "text-muted-foreground"} />
          </button>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.05)" }}
          >
            <Share2 size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Arabic */}
        <p
          className="text-center leading-[2.2] mb-3 text-foreground"
          style={{ fontFamily: "'Amiri Quran', serif", fontSize: 18 }}
        >
          ﴿{ayah.arabic}﴾
        </p>

        {/* Source */}
        <p className="text-center text-[11px] text-emerald-500/70 mb-3 font-semibold">
          سورة {ayah.surah} — الآية {ayah.ayahNum}
        </p>

        {/* Tafsir toggle */}
        <button
          onClick={() => setShowTafsir((s) => !s)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-colors"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <BookOpen size={13} className="text-emerald-500" />
          <span className="text-[12px] font-semibold text-emerald-600">
            {showTafsir ? "إخفاء التفسير" : "اقرأ التفسير"}
          </span>
          {showTafsir ? (
            <ChevronUp size={13} className="text-emerald-500" />
          ) : (
            <ChevronDown size={13} className="text-emerald-500" />
          )}
        </button>

        <AnimatePresence>
          {showTafsir && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="mt-3 p-3 rounded-xl"
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)" }}
              >
                <p className="text-[12px] leading-loose text-foreground/80 text-right">
                  {ayah.tafsir}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 px-1">
                <Zap size={11} className="text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-600 font-semibold">{ayah.memorize}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
