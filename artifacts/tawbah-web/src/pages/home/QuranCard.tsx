import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Flame, Check, BookOpen, ArrowLeft, Trophy } from "lucide-react";

const QURAN_BANNER_AYAHS = [
  { text: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ", ref: "الإسراء: ٩" },
  { text: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ", ref: "الإسراء: ٨٢" },
  { text: "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ", ref: "ص: ٢٩" },
  { text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", ref: "البخاري" },
];

const WIRD_LEVELS: Record<string, { label: string; icon: string; color: string }> = {
  mubtadi:  { label: "مبتدئ", icon: "🌱", color: "#10b981" },
  muntazim: { label: "منتظم", icon: "📖", color: "#c8a84b" },
  muhtasib: { label: "محتسب", icon: "⚡", color: "#3b82f6" },
  jadd:     { label: "جادّ", icon: "🔥", color: "#f59e0b" },
  khatim:   { label: "خاتم", icon: "👑", color: "#8b5cf6" },
};

const LEVEL_PAGES: Record<string, number> = { mubtadi: 2, muntazim: 5, muhtasib: 10, jadd: 15, khatim: 20 };

function todayStr() { return new Date().toISOString().split("T")[0]!; }

function getStorage(key: string, fb: string): string {
  try { return localStorage.getItem(key) ?? fb; } catch { return fb; }
}

export function SectionQuranCard() {
  const [ayahIdx, setAyahIdx] = useState(0);

  const levelId = getStorage("wird_level", "muntazim");
  const level = WIRD_LEVELS[levelId] ?? WIRD_LEVELS["muntazim"]!;
  const target = LEVEL_PAGES[levelId] ?? 5;

  const [totalDone, setTotalDone] = useState<number>(() => parseInt(getStorage("wird_total", "0")) || 0);
  const [streak, setStreak] = useState<number>(() => parseInt(getStorage("wird_streak", "0")) || 0);
  const [checked, setChecked] = useState<boolean[]>(() => {
    const savedDate = getStorage("wird_date", "");
    if (savedDate !== todayStr()) return Array(target).fill(false);
    try { const p = JSON.parse(getStorage("wird_checked", "[]")) as boolean[]; return Array.isArray(p) ? p : Array(target).fill(false); }
    catch { return Array(target).fill(false); }
  });
  const [completedToday, setCompletedToday] = useState(false);

  const safChecked = checked.length === target ? checked : Array(target).fill(false);
  const doneCount = safChecked.filter(Boolean).length;
  const allDone = doneCount >= target;
  const progress = Math.min((doneCount / target) * 100, 100);
  const khatmasDone = Math.floor(totalDone / 604);
  const khatmaProgress = ((totalDone % 604) / 604) * 100;

  useEffect(() => {
    const t = setInterval(() => setAyahIdx(i => (i + 1) % QURAN_BANNER_AYAHS.length), 5500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setCompletedToday(getStorage("wird_completed_date", "") === todayStr());
  }, []);

  const addPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allDone) return;
    const idx = safChecked.findIndex(c => !c);
    if (idx === -1) return;
    const next = [...safChecked];
    next[idx] = true;
    setChecked(next);
    try {
      localStorage.setItem("wird_checked", JSON.stringify(next));
      localStorage.setItem("wird_date", todayStr());
    } catch {}
    if (navigator.vibrate) navigator.vibrate(12);
    const newDone = next.filter(Boolean).length;
    if (newDone >= target && !completedToday) {
      const newTotal = totalDone + target;
      setTotalDone(newTotal);
      setStreak(s => s + 1);
      setCompletedToday(true);
      try {
        localStorage.setItem("wird_total", String(newTotal));
        localStorage.setItem("wird_completed_date", todayStr());
        localStorage.setItem("wird_streak", String(streak + 1));
      } catch {}
    }
  };

  return (
    <Link href="/quran">
      <div
        className="relative overflow-hidden rounded-[24px] cursor-pointer active:scale-[0.985] transition-transform"
        style={{
          background: "linear-gradient(160deg, #040d18 0%, #071428 45%, #030b15 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.3)",
        }}
      >
        {/* Stars */}
        {[[12,8],[88,5],[35,15],[65,7],[90,18],[20,22],[75,12],[50,4],[42,20],[80,24]].map(([x,y],i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{ left:`${x}%`, top:`${y}%`, width:i%3===0?2.5:1.5, height:i%3===0?2.5:1.5, background:i%2===0?"#c8a84b":"#7dd3fc" }}
            animate={{ opacity:[0.1,0.65,0.1] }}
            transition={{ duration:2.5+(i%4)*0.7, repeat:Infinity, delay:(i*0.4)%3 }}
          />
        ))}
        <div className="absolute inset-x-0 top-0 h-[120px] pointer-events-none" style={{ background:"radial-gradient(ellipse 70% 100% at 50% 0%, rgba(200,168,75,0.2) 0%, transparent 70%)", filter:"blur(18px)" }} />

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg, rgba(200,168,75,0.3) 0%, rgba(200,168,75,0.1) 100%)", border:"1px solid rgba(200,168,75,0.45)" }}>
                <span style={{ fontSize:20 }}>📖</span>
              </div>
              <div>
                <h2 className="font-bold leading-tight pt-[5px] pb-[5px]" style={{ fontSize:17, background:"linear-gradient(90deg, #ffffff 0%, #c8a84b 60%, #a07c2a 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontFamily:"'Amiri Quran', serif" }}>القرآن الكريم</h2>
                <p style={{ color:"rgba(200,168,75,0.55)", fontSize:10 }}>مكتبة شاملة — تلاوة وتفسير وعلوم</p>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-1.5">
              <div className="flex flex-col items-center px-2 py-1.5 rounded-xl" style={{ background:"rgba(200,168,75,0.1)", border:"1px solid rgba(200,168,75,0.2)" }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#c8a84b" }}>١١٤</span>
                <span style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>سورة</span>
              </div>
              {khatmasDone > 0 && (
                <div className="flex flex-col items-center px-2 py-1.5 rounded-xl" style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#8b5cf6" }}>{khatmasDone}×</span>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>ختمة</span>
                </div>
              )}
            </div>
          </div>

          {/* Rotating Ayah */}
          <div className="rounded-xl px-4 py-3 mb-3" style={{ background:"rgba(200,168,75,0.07)", border:"1px solid rgba(200,168,75,0.18)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={ayahIdx} initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-5 }} transition={{ duration:0.35 }}>
                <p className="text-center leading-loose mb-1" style={{ fontFamily:"'Amiri Quran', serif", fontSize:14.5, color:"rgba(255,255,255,0.9)" }}>
                  ﴿{QURAN_BANNER_AYAHS[ayahIdx]!.text}﴾
                </p>
                <p className="text-center" style={{ fontSize:10, color:"rgba(200,168,75,0.6)" }}>— {QURAN_BANNER_AYAHS[ayahIdx]!.ref}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Wird section */}
          <div className="rounded-xl p-3 mb-3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
            {/* Level + Streak row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{level.icon}</span>
                <div>
                  <span className="text-[11px] font-bold" style={{ color: level.color }}>{level.label}</span>
                  <span className="text-[9px] text-muted-foreground mr-1">· {target} ص/يوم</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {streak > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.25)" }}>
                    <Flame size={10} style={{ color:"#f59e0b" }} />
                    <span className="text-[10px] font-bold" style={{ color:"#f59e0b" }}>{streak}</span>
                  </div>
                )}
                <span className="text-[10px] font-bold" style={{ color: allDone ? "#10b981" : "rgba(200,168,75,0.8)" }}>
                  {allDone ? "✓ مكتمل" : `${doneCount}/${target}`}
                </span>
              </div>
            </div>

            {/* Khatma mini bar */}
            <div className="mb-1.5">
              <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                <span>تقدم الختمة</span>
                <span>{Math.round(khatmaProgress)}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background:"#c8a84b80" }} animate={{ width:`${khatmaProgress}%` }} transition={{ duration:0.6 }} />
              </div>
            </div>

            {/* Daily wird bar */}
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background:"rgba(255,255,255,0.08)" }}>
              <motion.div className="h-full rounded-full" style={{ background: allDone ? "#10b981" : "linear-gradient(90deg,#c8a84b,#f0d070)" }} animate={{ width:`${progress}%` }} transition={{ duration:0.6 }} />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={addPage}
                disabled={allDone}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] active:scale-[0.94] transition-all"
                style={{ background: allDone ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg,rgba(200,168,75,0.3),rgba(200,168,75,0.15))", border:`1px solid ${allDone ? "rgba(16,185,129,0.4)" : "rgba(200,168,75,0.4)"}`, color: allDone ? "#10b981" : "#c8a84b" }}
              >
                {allDone ? <><Check size={11} /> تم الورد</> : <><BookOpen size={11} /> + صفحة</>}
              </button>
              <Link
                href="/quran/wird"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-muted-foreground px-2 py-1.5 rounded-lg"
                style={{ background:"rgba(255,255,255,0.05)" }}
              >
                التفاصيل <ArrowLeft size={9} />
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { icon:"📄", label:"اقرأ", href:"/quran/read", color:"rgba(200,168,75,0.1)" },
              { icon:"🔊", label:"استمع", href:"/quran/listen", color:"rgba(59,130,246,0.1)" },
              { icon:"💡", label:"تفسير", href:"/quran/tafsir", color:"rgba(139,92,246,0.1)" },
              { icon:"📌", label:"مفضلة", href:"/quran/bookmarks", color:"rgba(245,158,11,0.1)" },
            ].map(a => (
              <Link
                key={a.label}
                href={a.href}
                onClick={e => e.stopPropagation()}
                className="flex flex-col items-center gap-1 py-2 rounded-xl active:scale-[0.94] transition-all"
                style={{ background: a.color, border:"1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-base leading-none">{a.icon}</span>
                <span className="text-[9px] text-muted-foreground">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
