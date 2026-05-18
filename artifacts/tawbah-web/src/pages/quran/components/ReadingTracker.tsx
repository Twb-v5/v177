import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, BookOpen } from "lucide-react";
import {
  WIRD_TARGET,
  MUSHAF_PAGES,
  getSurahForPage,
  todayDateStr,
} from "./quranData";

export function ReadingTracker() {
  const [totalDone, setTotalDone] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("wird_total") ?? "0") || 0; } catch { return 0; }
  });

  const [streak, setStreak] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("wird_streak") ?? "0") || 0; } catch { return 0; }
  });

  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const savedDate = localStorage.getItem("wird_date");
      if (savedDate !== todayDateStr()) return Array(WIRD_TARGET).fill(false);
      const raw = localStorage.getItem("wird_checked");
      if (!raw) return Array(WIRD_TARGET).fill(false);
      const parsed = JSON.parse(raw) as boolean[];
      return Array.isArray(parsed) && parsed.length === WIRD_TARGET ? parsed : Array(WIRD_TARGET).fill(false);
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
          const prevDate = new Date(savedDate);
          const todayDate = new Date(today);
          const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / 86400000);
          const newStreak = diffDays === 1 ? streak + 1 : 1;
          setStreak(newStreak);
          localStorage.setItem("wird_streak", String(newStreak));
        } else {
          setStreak(0);
          localStorage.setItem("wird_streak", "0");
        }
        setChecked(Array(WIRD_TARGET).fill(false));
        setCompletedToday(false);
        localStorage.setItem("wird_date", today);
        localStorage.setItem("wird_checked", JSON.stringify(Array(WIRD_TARGET).fill(false)));
      } else if (!savedDate) {
        localStorage.setItem("wird_date", today);
      }
    } catch {}
  }, []);

  const startPageIdx = totalDone % MUSHAF_PAGES;
  const todayPages = Array.from({ length: WIRD_TARGET }, (_, i) =>
    ((startPageIdx + i) % MUSHAF_PAGES) + 1
  );

  const doneCount = checked.filter(Boolean).length;
  const allDone = doneCount >= WIRD_TARGET;
  const progress = (doneCount / WIRD_TARGET) * 100;

  const khatmasDone = Math.floor(totalDone / MUSHAF_PAGES);
  const khatmaProgress = ((totalDone % MUSHAF_PAGES) / MUSHAF_PAGES) * 100;

  const togglePage = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    setChecked(next);
    try {
      localStorage.setItem("wird_checked", JSON.stringify(next));
      localStorage.setItem("wird_date", todayDateStr());
    } catch {}

    const newDoneCount = next.filter(Boolean).length;
    if (newDoneCount >= WIRD_TARGET && !completedToday) {
      const newTotal = totalDone + WIRD_TARGET;
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

  const nextStartPage = ((totalDone + WIRD_TARGET) % MUSHAF_PAGES) + 1;

  return (
    <div
      className="rounded-[22px] overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(200,168,75,0.1) 0%, rgba(200,168,75,0.03) 100%)",
        border: "1px solid rgba(200,168,75,0.25)",
      }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-bold text-sm">ورد القرآن اليومي</h3>
            <p className="text-[11px] text-muted-foreground">
              {WIRD_TARGET} صفحات يومياً — من صفحة {todayPages[0]} إلى {todayPages[WIRD_TARGET - 1]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {khatmasDone > 0 && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <span className="text-[10px] font-bold text-emerald-500">×{khatmasDone} ختمة</span>
              </div>
            )}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.25)" }}
            >
              <Flame size={12} style={{ color: "#c8a84b" }} />
              <span className="font-bold text-[13px]" style={{ color: "#c8a84b" }}>{streak}</span>
              <span className="text-[10px] text-muted-foreground">يوم</span>
            </div>
          </div>
        </div>

        {/* Surah context */}
        <p className="text-[11px] mb-3" style={{ color: "rgba(200,168,75,0.75)" }}>
          📖 سورة {getSurahForPage(todayPages[0]!)}
          {getSurahForPage(todayPages[WIRD_TARGET - 1]!) !== getSurahForPage(todayPages[0]!) &&
            ` — ${getSurahForPage(todayPages[WIRD_TARGET - 1]!)}`}
        </p>

        {/* Overall progress bar (khatma) */}
        <div className="mb-1">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>تقدم الختمة</span>
            <span>{totalDone} / {MUSHAF_PAGES} ص</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #c8a84b88, #c8a84b)" }}
              animate={{ width: `${khatmaProgress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ── Today's 5 pages ── */}
      <div className="px-4 pb-2">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
          <span>ورد اليوم</span>
          <span>{doneCount} / {WIRD_TARGET} صفحات</span>
        </div>

        {/* Daily progress bar */}
        <div className="h-2 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #c8a84b, #f0d070)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* 5 page tiles */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {todayPages.map((pg, idx) => {
            const isDone = checked[idx] ?? false;
            return (
              <button
                key={idx}
                onClick={() => togglePage(idx)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-[0.93]"
                style={{
                  background: isDone
                    ? "linear-gradient(145deg, rgba(200,168,75,0.4), rgba(200,168,75,0.18))"
                    : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${isDone ? "rgba(200,168,75,0.6)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isDone ? "0 2px 10px rgba(200,168,75,0.15)" : "none",
                }}
              >
                {isDone ? (
                  <Check size={14} style={{ color: "#c8a84b" }} />
                ) : (
                  <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {pg}
                  </span>
                )}
                <span
                  className="text-[9px] font-medium leading-none"
                  style={{ color: isDone ? "#c8a84b" : "rgba(255,255,255,0.25)" }}
                >
                  {isDone ? "✓ قرأت" : `ص ${pg}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Open quran.com at current page */}
        <a
          href={`https://quran.com/${getSurahForPage(todayPages[0]!).replace(/\s/g, "-")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-[0.97] mb-3"
          style={{
            background: allDone
              ? "rgba(16,185,129,0.12)"
              : "linear-gradient(135deg, rgba(200,168,75,0.22), rgba(200,168,75,0.1))",
            border: `1px solid ${allDone ? "rgba(16,185,129,0.35)" : "rgba(200,168,75,0.35)"}`,
            color: allDone ? "#10b981" : "#c8a84b",
          }}
        >
          {allDone ? (
            <><Check size={13} /> أتممت وردك! — ورد الغد: ص {nextStartPage}</>
          ) : (
            <><BookOpen size={13} /> افتح المصحف — ابدأ من صفحة {todayPages[0]}</>
          )}
        </a>
      </div>

      {/* ── Celebration ── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="mx-4 mb-4 py-3 px-4 rounded-2xl text-center"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <p className="text-sm font-bold text-emerald-400 mb-0.5">🎉 أتممت وردك اليوم!</p>
              <p className="text-[11px] text-muted-foreground">
                ورد الغد: صفحات {nextStartPage} — {((totalDone + WIRD_TARGET - 1) % MUSHAF_PAGES) + 1}
              </p>
              {khatmasDone > 0 && Math.floor((totalDone) / MUSHAF_PAGES) > Math.floor((totalDone - WIRD_TARGET) / MUSHAF_PAGES) && (
                <p className="text-[11px] font-bold text-amber-400 mt-1">✨ ألف مبروك — أتممت ختمة كاملة!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
