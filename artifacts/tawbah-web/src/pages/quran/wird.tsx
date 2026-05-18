import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Check, BookOpen, Trophy, Star, ChevronDown, ChevronUp, Share2, RotateCcw, Target, Calendar, TrendingUp } from "lucide-react";
import { StandardHeader } from "@/components/header/StandardHeader";
import { getSurahForPage, todayDateStr } from "./components/quranData";

// ─── Constants ───────────────────────────────────────────────────────────────

const MUSHAF_PAGES = 604;

const WIRD_LEVELS = [
  { id: "mubtadi", label: "مبتدئ", pages: 2, icon: "🌱", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", desc: "صفحتان يومياً — الاستمرارية أهم" },
  { id: "muntazim", label: "منتظم", pages: 5, icon: "📖", color: "#c8a84b", bg: "rgba(200,168,75,0.12)", border: "rgba(200,168,75,0.3)", desc: "٥ صفحات — ربع جزء يومياً" },
  { id: "muhtasib", label: "محتسب", pages: 10, icon: "⚡", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", desc: "١٠ صفحات — نصف جزء يومياً" },
  { id: "jadd", label: "جادّ", pages: 15, icon: "🔥", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", desc: "١٥ صفحة — ثلاثة أرباع جزء" },
  { id: "khatim", label: "خاتم", pages: 20, icon: "👑", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", desc: "٢٠ صفحة — ختم كل شهر" },
];

const ACHIEVEMENTS = [
  { id: "first_day", title: "أول خطوة", desc: "أكملت وردك ليوم واحد", icon: "🌟", condition: (streak: number, _khatma: number, _total: number) => streak >= 1 },
  { id: "week", title: "أسبوع المثابرة", desc: "٧ أيام متتالية", icon: "🗓️", condition: (streak: number, _k: number, _t: number) => streak >= 7 },
  { id: "month", title: "شهر النور", desc: "٣٠ يوماً متتالية", icon: "🌙", condition: (streak: number, _k: number, _t: number) => streak >= 30 },
  { id: "first_khatma", title: "أول ختمة", desc: "أتممت ختمة كاملة", icon: "📜", condition: (_s: number, khatma: number, _t: number) => khatma >= 1 },
  { id: "three_khatma", title: "ثلاث ختمات", desc: "٣ ختمات متتالية", icon: "💎", condition: (_s: number, khatma: number, _t: number) => khatma >= 3 },
  { id: "hundred_days", title: "مئة يوم", desc: "١٠٠ يوم من القرآن", icon: "💯", condition: (streak: number, _k: number, _t: number) => streak >= 100 },
];

function getStorage(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function setStorage(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WirdPage() {
  const [levelId, setLevelId] = useState<string>(() => getStorage("wird_level", "muntazim"));
  const [totalDone, setTotalDone] = useState<number>(() => parseInt(getStorage("wird_total", "0")) || 0);
  const [streak, setStreak] = useState<number>(() => parseInt(getStorage("wird_streak", "0")) || 0);
  const [checked, setChecked] = useState<boolean[]>(() => {
    const savedDate = getStorage("wird_date", "");
    if (savedDate !== todayDateStr()) return [];
    try { const p = JSON.parse(getStorage("wird_checked", "[]")) as boolean[]; return Array.isArray(p) ? p : []; }
    catch { return []; }
  });
  const [completedToday, setCompletedToday] = useState<boolean>(() => getStorage("wird_completed_date", "") === todayDateStr());
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [historyLog, setHistoryLog] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(getStorage("wird_history", "{}")) as Record<string, boolean>; } catch { return {}; }
  });

  const level = WIRD_LEVELS.find(l => l.id === levelId) ?? WIRD_LEVELS[1]!;
  const target = level.pages;

  // ensure checked array matches current target
  const safChecked: boolean[] = checked.length === target ? checked : Array(target).fill(false);

  // auto-reset on new day
  useEffect(() => {
    const savedDate = getStorage("wird_date", "");
    const today = todayDateStr();
    if (savedDate && savedDate !== today) {
      const wasCompleted = getStorage("wird_completed_date", "") === savedDate;
      if (wasCompleted) {
        const prev = new Date(savedDate);
        const diff = Math.round((new Date(today).getTime() - prev.getTime()) / 86400000);
        const newStreak = diff === 1 ? streak + 1 : 1;
        setStreak(newStreak);
        setStorage("wird_streak", String(newStreak));
        // save to history
        const log = { ...historyLog, [savedDate]: true };
        setHistoryLog(log);
        setStorage("wird_history", JSON.stringify(log));
      } else {
        setStreak(0);
        setStorage("wird_streak", "0");
        const log = { ...historyLog, [savedDate]: false };
        setHistoryLog(log);
        setStorage("wird_history", JSON.stringify(log));
      }
      setChecked(Array(target).fill(false));
      setCompletedToday(false);
      setStorage("wird_date", today);
      setStorage("wird_checked", JSON.stringify(Array(target).fill(false)));
    } else if (!savedDate) {
      setStorage("wird_date", today);
    }
  }, []);

  const startPageIdx = totalDone % MUSHAF_PAGES;
  const todayPages = Array.from({ length: target }, (_, i) => ((startPageIdx + i) % MUSHAF_PAGES) + 1);

  const doneCount = safChecked.filter(Boolean).length;
  const allDone = doneCount >= target;
  const progress = (doneCount / target) * 100;
  const khatmasDone = Math.floor(totalDone / MUSHAF_PAGES);
  const khatmaProgress = ((totalDone % MUSHAF_PAGES) / MUSHAF_PAGES) * 100;

  const togglePage = (idx: number) => {
    const next = [...safChecked];
    if (idx >= next.length) { for (let i = next.length; i <= idx; i++) next.push(false); }
    next[idx] = !next[idx];
    setChecked(next);
    setStorage("wird_checked", JSON.stringify(next));
    setStorage("wird_date", todayDateStr());
    const newDone = next.filter(Boolean).length;
    if (newDone >= target && !completedToday) {
      const newTotal = totalDone + target;
      setTotalDone(newTotal);
      setCompletedToday(true);
      setShowCelebration(true);
      setStorage("wird_total", String(newTotal));
      setStorage("wird_completed_date", todayDateStr());
      const log = { ...historyLog, [todayDateStr()]: true };
      setHistoryLog(log);
      setStorage("wird_history", JSON.stringify(log));
      setTimeout(() => setShowCelebration(false), 5000);
    }
  };

  const changeLevel = (id: string) => {
    setLevelId(id);
    setStorage("wird_level", id);
    setShowLevelPicker(false);
    const newTarget = WIRD_LEVELS.find(l => l.id === id)?.pages ?? 5;
    setChecked(Array(newTarget).fill(false));
    setStorage("wird_checked", JSON.stringify(Array(newTarget).fill(false)));
    setCompletedToday(false);
  };

  const resetToday = () => {
    setChecked(Array(target).fill(false));
    setCompletedToday(false);
    setStorage("wird_checked", JSON.stringify(Array(target).fill(false)));
    setStorage("wird_completed_date", "");
    if (totalDone >= target) { setTotalDone(totalDone - target); setStorage("wird_total", String(totalDone - target)); }
  };

  // last 30 days for calendar
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0]!;
    const isToday = key === todayDateStr();
    return { key, day: d.getDate(), isToday, status: isToday ? (allDone ? "done" : "partial") : (historyLog[key] === true ? "done" : historyLog[key] === false ? "missed" : "empty") };
  });

  return (
    <div className="min-h-screen pb-28" dir="rtl">
      <StandardHeader title="ورد القرآن اليومي" subtitle="تتبع قراءتك" showBack />
      <div className="px-4 pt-4 flex flex-col gap-5">

        {/* ── Level Header ── */}
        <div
          className="rounded-[22px] p-4"
          style={{ background: level.bg, border: `1px solid ${level.border}` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{level.icon}</span>
              <div>
                <p className="font-bold text-base" style={{ color: level.color }}>{level.label}</p>
                <p className="text-[11px] text-muted-foreground">{level.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLevelPicker(s => !s)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--foreground)" }}
            >
              غيّر المستوى {showLevelPicker ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "سلسلة", value: streak, icon: <Flame size={13} style={{ color: "#f59e0b" }} />, suffix: "يوم" },
              { label: "ختمات", value: khatmasDone, icon: <Trophy size={13} style={{ color: "#8b5cf6" }} />, suffix: "" },
              { label: "إجمالي", value: totalDone, icon: <BookOpen size={13} style={{ color: level.color }} />, suffix: "ص" },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.12)" }}>
                <div className="flex items-center gap-1 mb-0.5">{s.icon}<span className="font-bold text-sm">{s.value}</span><span className="text-[9px] text-muted-foreground">{s.suffix}</span></div>
                <span className="text-[9px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Level Picker ── */}
        <AnimatePresence>
          {showLevelPicker && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex flex-col gap-2 -mt-3">
                {WIRD_LEVELS.map(lv => (
                  <button
                    key={lv.id}
                    onClick={() => changeLevel(lv.id)}
                    className="flex items-center gap-3 p-3 rounded-xl text-right transition-all active:scale-[0.97]"
                    style={{ background: levelId === lv.id ? lv.bg : "rgba(255,255,255,0.03)", border: `1px solid ${levelId === lv.id ? lv.border : "rgba(255,255,255,0.07)"}` }}
                  >
                    <span className="text-2xl">{lv.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: levelId === lv.id ? lv.color : "var(--foreground)" }}>{lv.label} — {lv.pages} صفحات/يوم</p>
                      <p className="text-[10px] text-muted-foreground">{lv.desc}</p>
                    </div>
                    {levelId === lv.id && <Check size={15} style={{ color: lv.color }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Today's Wird ── */}
        <div className="rounded-[22px] overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(200,168,75,0.1), rgba(200,168,75,0.03))", border: "1px solid rgba(200,168,75,0.25)" }}>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="font-bold text-sm">ورد اليوم</h3>
                <p className="text-[11px] text-muted-foreground">
                  من صفحة {todayPages[0]} إلى {todayPages[target - 1]} — سورة {getSurahForPage(todayPages[0]!)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold" style={{ color: allDone ? "#10b981" : "#c8a84b" }}>
                  {allDone ? "✓ مكتمل" : `${doneCount}/${target}`}
                </span>
              </div>
            </div>
            {/* Khatma bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>تقدم الختمة</span>
                <span>{totalDone % MUSHAF_PAGES} / {MUSHAF_PAGES} ص</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #c8a84b80, #c8a84b)" }} animate={{ width: `${khatmaProgress}%` }} transition={{ duration: 0.6 }} />
              </div>
            </div>
            {/* Daily progress bar */}
            <div className="h-2 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <motion.div className="h-full rounded-full" style={{ background: allDone ? "#10b981" : "linear-gradient(90deg, #c8a84b, #f0d070)" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          {/* Page tiles */}
          <div className={`px-4 pb-3 grid gap-2 ${target <= 5 ? "grid-cols-5" : target <= 10 ? "grid-cols-5" : "grid-cols-5"}`}>
            {todayPages.map((pg, idx) => {
              const isDone = safChecked[idx] ?? false;
              return (
                <button
                  key={idx}
                  onClick={() => togglePage(idx)}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl transition-all active:scale-[0.93]"
                  style={{
                    background: isDone ? "linear-gradient(145deg, rgba(200,168,75,0.4), rgba(200,168,75,0.18))" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${isDone ? "rgba(200,168,75,0.6)" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isDone ? "0 2px 10px rgba(200,168,75,0.15)" : "none",
                  }}
                >
                  {isDone ? <Check size={13} style={{ color: "#c8a84b" }} /> : <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{pg}</span>}
                  <span className="text-[8px] leading-none" style={{ color: isDone ? "#c8a84b" : "rgba(255,255,255,0.2)" }}>{isDone ? "تم" : `ص${pg}`}</span>
                </button>
              );
            })}
          </div>

          {/* For targets > 5, show extra pages in compact rows */}
          {target > 5 && (
            <div className="px-4 pb-3">
              <p className="text-[10px] text-muted-foreground mb-2 text-center">
                {doneCount}/{target} صفحة — اضغط على أي صفحة لتعليمها
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {todayPages.slice(5).map((pg, idx) => {
                  const realIdx = idx + 5;
                  const isDone = safChecked[realIdx] ?? false;
                  return (
                    <button
                      key={realIdx}
                      onClick={() => togglePage(realIdx)}
                      className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all active:scale-[0.93]"
                      style={{
                        background: isDone ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isDone ? "rgba(200,168,75,0.5)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {isDone ? <Check size={11} style={{ color: "#c8a84b" }} /> : <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>{pg}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Open Quran button */}
          <div className="px-4 pb-4">
            <a
              href={`https://quran.ksu.edu.sa/index.php#aya=1_1&m=hafs`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-[0.97] mb-2"
              style={{ background: allDone ? "rgba(16,185,129,0.12)" : "linear-gradient(135deg, rgba(200,168,75,0.22), rgba(200,168,75,0.1))", border: `1px solid ${allDone ? "rgba(16,185,129,0.35)" : "rgba(200,168,75,0.35)"}`, color: allDone ? "#10b981" : "#c8a84b" }}
            >
              {allDone ? <><Check size={13} /> أتممت وردك! بارك الله فيك</> : <><BookOpen size={13} /> افتح المصحف — ابدأ من صفحة {todayPages[0]}</>}
            </a>
            <button
              onClick={resetToday}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[10px] text-muted-foreground"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <RotateCcw size={10} /> إعادة تعيين ورد اليوم
            </button>
          </div>
        </div>

        {/* ── Celebration ── */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="rounded-[22px] p-4 text-center" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}>
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-base font-bold text-emerald-400 mb-1">أتممت وردك اليوم!</p>
              <p className="text-[11px] text-muted-foreground">سلسلتك: {streak + 1} يوم — {khatmasDone > 0 ? `${khatmasDone} ختمة` : "في الطريق"}</p>
              {khatmasDone > 0 && Math.floor(totalDone / MUSHAF_PAGES) > Math.floor((totalDone - target) / MUSHAF_PAGES) && (
                <p className="text-sm font-bold text-amber-400 mt-2">✨ مبروك! أتممت ختمة كاملة!</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Calendar / 30-day heatmap ── */}
        <div className="rounded-[22px] overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => setShowCalendar(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Calendar size={15} style={{ color: "#c8a84b" }} />
              <span className="font-bold text-sm">سجل الـ ٣٠ يوماً</span>
            </div>
            {showCalendar ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showCalendar && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-10 gap-1.5">
                    {calendarDays.map(d => (
                      <div key={d.key} className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold"
                          style={{
                            background: d.status === "done" ? "#10b981" : d.status === "missed" ? "rgba(239,68,68,0.3)" : d.status === "partial" ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.05)",
                            border: d.isToday ? "1.5px solid #c8a84b" : "1px solid transparent",
                            color: d.status === "done" ? "#fff" : d.status === "missed" ? "#fca5a5" : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {d.day}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-3 justify-center">
                    {[{ color: "#10b981", label: "مكتمل" }, { color: "rgba(239,68,68,0.5)", label: "فائت" }, { color: "rgba(200,168,75,0.4)", label: "جزئي" }].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                        <span className="text-[9px] text-muted-foreground">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Achievements ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={15} style={{ color: "#c8a84b" }} />
            <h3 className="font-bold text-sm">الإنجازات</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map(a => {
              const earned = a.condition(streak, khatmasDone, totalDone);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ background: earned ? "rgba(200,168,75,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${earned ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.06)"}`, opacity: earned ? 1 : 0.5 }}
                >
                  <span className="text-xl shrink-0" style={{ filter: earned ? "none" : "grayscale(1)" }}>{a.icon}</span>
                  <div>
                    <p className="text-[11px] font-bold leading-tight" style={{ color: earned ? "#c8a84b" : "var(--foreground)" }}>{a.title}</p>
                    <p className="text-[9px] text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recommended Reading Plans ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target size={15} style={{ color: "#3b82f6" }} />
            <h3 className="font-bold text-sm">خطط التلاوة المقترحة</h3>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { label: "ختمة في رمضان (١٠ أيام)", pages: 60, icon: "🌙", desc: "٦٠ صفحة يومياً — للمتفرغين" },
              { label: "ختمة شهرية", pages: 20, icon: "📅", desc: "٢٠ صفحة يومياً — ختمة كل شهر" },
              { label: "ختمة الجمعة", pages: 87, icon: "⭐", desc: "ختم كل جمعة — ٨٧ صفحة يومياً" },
              { label: "ختمة الجزء يومياً", pages: 20, icon: "📖", desc: "جزء يومياً — ختمة في ٣٠ يوماً" },
            ].map(plan => (
              <div key={plan.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-xl shrink-0">{plan.icon}</span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold">{plan.label}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.desc}</p>
                </div>
                <button
                  onClick={() => {
                    const closest = WIRD_LEVELS.reduce((a, b) => Math.abs(b.pages - plan.pages) < Math.abs(a.pages - plan.pages) ? b : a);
                    changeLevel(closest.id);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)" }}
                >
                  تطبيق
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Share Progress ── */}
        <button
          onClick={() => {
            const text = `📖 وردي القرآني اليوم: ${doneCount}/${target} صفحة\n🔥 السلسلة: ${streak} يوم\n🏆 الختمات: ${khatmasDone}\n\nبتطبيق دليل التوبة النصوح`;
            if (navigator.share) { navigator.share({ text }).catch(() => {}); }
            else { navigator.clipboard.writeText(text).catch(() => {}); }
          }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-[22px] font-bold text-sm"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6" }}
        >
          <Share2 size={14} /> مشاركة تقدمي
        </button>

      </div>
    </div>
  );
}
