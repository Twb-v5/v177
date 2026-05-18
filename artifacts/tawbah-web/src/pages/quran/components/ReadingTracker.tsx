import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import {
  WIRD_TARGET, MUSHAF_PAGES, getSurahForPage, todayDateStr,
} from "./quranData";

export function ReadingTracker() {
  const [totalDone, setTotalDone] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("wird_total") ?? "0") || 0; } catch { return 0; }
  });
  const [streak, setStreak] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("wird_streak") ?? "0") || 0; } catch { return 0; }
  });
  const [target] = useState<number>(() => {
    const levelId = (() => { try { return localStorage.getItem("wird_level") ?? "muntazim"; } catch { return "muntazim"; } })();
    const levelPages: Record<string, number> = { mubtadi: 2, muntazim: 5, muhtasib: 10, jadd: 15, khatim: 20 };
    return levelPages[levelId] ?? 5;
  });
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const savedDate = localStorage.getItem("wird_date");
      if (savedDate !== todayDateStr()) return Array(WIRD_TARGET).fill(false);
      const raw = localStorage.getItem("wird_checked");
      if (!raw) return Array(WIRD_TARGET).fill(false);
      const parsed = JSON.parse(raw) as boolean[];
      return Array.isArray(parsed) ? parsed : Array(WIRD_TARGET).fill(false);
    } catch { return Array(WIRD_TARGET).fill(false); }
  });
  const [completedToday, setCompletedToday] = useState<boolean>(() => {
    try { return localStorage.getItem("wird_completed_date") === todayDateStr(); } catch { return false; }
  });
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    try {
      const savedDate = localStorage.getItem("wird_date");
      const today = todayDateStr();
      if (savedDate && savedDate !== today) {
        const wasCompleted = localStorage.getItem("wird_completed_date") === savedDate;
        if (wasCompleted) {
          const diff = Math.round((new Date(today).getTime() - new Date(savedDate).getTime()) / 86400000);
          const newStreak = diff === 1 ? streak + 1 : 1;
          setStreak(newStreak);
          localStorage.setItem("wird_streak", String(newStreak));
        } else {
          setStreak(0);
          localStorage.setItem("wird_streak", "0");
        }
        setChecked(Array(target).fill(false));
        setCompletedToday(false);
        localStorage.setItem("wird_date", today);
        localStorage.setItem("wird_checked", JSON.stringify(Array(target).fill(false)));
      } else if (!savedDate) {
        localStorage.setItem("wird_date", today);
      }
    } catch {}
  }, []);

  const startPageIdx = totalDone % MUSHAF_PAGES;
  const effectiveTarget = Math.max(WIRD_TARGET, target);
  const todayPages = Array.from({ length: effectiveTarget }, (_, i) => ((startPageIdx + i) % MUSHAF_PAGES) + 1);
  const safChecked = checked.length >= effectiveTarget ? checked : [...checked, ...Array(effectiveTarget - checked.length).fill(false)];
  const doneCount = safChecked.slice(0, effectiveTarget).filter(Boolean).length;
  const allDone = doneCount >= effectiveTarget;
  const progress = (doneCount / effectiveTarget) * 100;
  const khatmasDone = Math.floor(totalDone / MUSHAF_PAGES);
  const khatmaProgress = ((totalDone % MUSHAF_PAGES) / MUSHAF_PAGES) * 100;

  const togglePage = (idx: number) => {
    const next = [...safChecked];
    next[idx] = !next[idx];
    setChecked(next);
    try {
      localStorage.setItem("wird_checked", JSON.stringify(next));
      localStorage.setItem("wird_date", todayDateStr());
    } catch {}
    const newDone = next.filter(Boolean).length;
    if (newDone >= effectiveTarget && !completedToday) {
      const newTotal = totalDone + effectiveTarget;
      setTotalDone(newTotal);
      setCompletedToday(true);
      setShowCelebration(true);
      try {
        localStorage.setItem("wird_total", String(newTotal));
        localStorage.setItem("wird_completed_date", todayDateStr());
      } catch {}
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  const displayPages = todayPages.slice(0, Math.min(5, effectiveTarget));
  const extraCount = effectiveTarget - displayPages.length;

  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(200,168,75,0.1) 0%, rgba(200,168,75,0.03) 100%)",
        border: "1px solid rgba(200,168,75,0.25)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-bold text-sm">ورد القرآن اليومي</h3>
            <p className="text-[11px] text-muted-foreground">
              {effectiveTarget} صفحات · من ص{todayPages[0]} · سورة {getSurahForPage(todayPages[0]!)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {khatmasDone > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <span className="text-[9px] font-bold text-emerald-500">×{khatmasDone}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full" style={{ background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.25)" }}>
              <Flame size={11} style={{ color: "#c8a84b" }} />
              <span className="font-bold text-[12px]" style={{ color: "#c8a84b" }}>{streak}</span>
            </div>
          </div>
        </div>

        {/* Khatma progress bar */}
        <div className="mb-1">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>تقدم الختمة</span>
            <span>{totalDone % MUSHAF_PAGES} / {MUSHAF_PAGES} ص</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #c8a84b88, #c8a84b)" }} animate={{ width: `${khatmaProgress}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
          </div>
        </div>
      </div>

      {/* Daily pages */}
      <div className="px-4 pb-2">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
          <span>ورد اليوم</span>
          <span>{doneCount}/{effectiveTarget} صفحات</span>
        </div>
        <div className="h-2 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="h-full rounded-full" style={{ background: allDone ? "#10b981" : "linear-gradient(90deg, #c8a84b, #f0d070)" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>

        <div className="grid grid-cols-5 gap-2 mb-3">
          {displayPages.map((pg, idx) => {
            const isDone = safChecked[idx] ?? false;
            return (
              <button
                key={idx}
                onClick={() => togglePage(idx)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-[0.93]"
                style={{
                  background: isDone ? "linear-gradient(145deg, rgba(200,168,75,0.4), rgba(200,168,75,0.18))" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${isDone ? "rgba(200,168,75,0.6)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isDone ? "0 2px 10px rgba(200,168,75,0.15)" : "none",
                }}
              >
                {isDone ? <Check size={14} style={{ color: "#c8a84b" }} /> : <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>{pg}</span>}
                <span className="text-[9px] font-medium leading-none" style={{ color: isDone ? "#c8a84b" : "rgba(255,255,255,0.25)" }}>{isDone ? "✓" : `ص${pg}`}</span>
              </button>
            );
          })}
        </div>

        {extraCount > 0 && (
          <p className="text-center text-[10px] text-muted-foreground mb-2">+ {extraCount} صفحات إضافية في صفحة الورد</p>
        )}

        <div className="flex gap-2">
          <a
            href={`https://quran.ksu.edu.sa/index.php#aya=1_1&m=hafs`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-[0.97]"
            style={{ background: allDone ? "rgba(16,185,129,0.12)" : "linear-gradient(135deg, rgba(200,168,75,0.22), rgba(200,168,75,0.1))", border: `1px solid ${allDone ? "rgba(16,185,129,0.35)" : "rgba(200,168,75,0.35)"}`, color: allDone ? "#10b981" : "#c8a84b" }}
          >
            {allDone ? <><Check size={13} /> مكتمل</> : <><BookOpen size={13} /> افتح المصحف</>}
          </a>
          <Link
            href="/quran/wird"
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[11px] font-bold"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--muted-foreground)" }}
          >
            تفاصيل <ArrowLeft size={11} />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mx-4 mb-4 py-3 px-4 rounded-2xl text-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <p className="text-sm font-bold text-emerald-400 mb-0.5">🎉 أتممت وردك اليوم!</p>
              {khatmasDone > 0 && <p className="text-[11px] font-bold text-amber-400">✨ ختمة رقم {khatmasDone}!</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
