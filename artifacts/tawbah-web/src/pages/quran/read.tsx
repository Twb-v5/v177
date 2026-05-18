import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Search, BookOpen, List, X,
  ZoomIn, ZoomOut, Bookmark, BookmarkCheck,
  SkipBack, SkipForward
} from "lucide-react";
import { useLocation } from "wouter";
import { saveBookmark, removeBookmark, isBookmarked } from "./bookmarks";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_PAGES = 604;

// Start page (1-indexed) for each surah (index 0 = surah 1)
const SURAH_START_PAGES: number[] = [
  1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,305,312,
  322,333,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,
  477,483,489,496,499,502,507,511,515,518,520,523,526,528,531,534,537,542,545,549,
  551,553,554,556,558,560,562,564,566,568,570,572,574,575,577,578,580,582,583,585,
  586,587,587,589,590,591,591,592,593,594,595,595,596,596,597,597,598,598,599,599,
  600,600,601,601,601,602,602,602,603,603,603,604,604,604
];

const SURAH_NAMES: string[] = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

// Juz start pages
const JUZ_START_PAGES: number[] = [
  1,22,42,62,82,102,121,142,162,182,
  201,222,242,262,282,302,322,342,362,382,
  402,422,442,462,482,502,522,542,562,582
];

function getSurahForPage(page: number): string {
  let name = SURAH_NAMES[0]!;
  for (let i = 0; i < SURAH_START_PAGES.length; i++) {
    if (page >= SURAH_START_PAGES[i]!) name = SURAH_NAMES[i]!;
    else break;
  }
  return name;
}

function getSurahIdForPage(page: number): number {
  let id = 1;
  for (let i = 0; i < SURAH_START_PAGES.length; i++) {
    if (page >= SURAH_START_PAGES[i]!) id = i + 1;
    else break;
  }
  return id;
}

function getJuzForPage(page: number): number {
  let juz = 1;
  for (let i = 0; i < JUZ_START_PAGES.length; i++) {
    if (page >= JUZ_START_PAGES[i]!) juz = i + 1;
    else break;
  }
  return juz;
}

function pageImageUrl(page: number): string {
  return `https://quran.ksu.edu.sa/tafseer/hafs/page${String(page).padStart(3, "0")}.png`;
}

function getStorage(key: string, fb: string): string {
  try { return localStorage.getItem(key) ?? fb; } catch { return fb; }
}
function setStorage(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch {}
}

// ─── Surah Picker Sheet ────────────────────────────────────────────────────────

function SurahPickerSheet({ onSelect, onClose }: { onSelect: (page: number) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = SURAH_NAMES.map((name, i) => ({ id: i + 1, name, page: SURAH_START_PAGES[i]! }))
    .filter(s => !search || s.name.includes(search) || String(s.id).includes(search));

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-card rounded-t-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "80dvh" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="px-4 py-2 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">اختر سورة</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center"><X size={14} /></button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن سورة..." dir="rtl"
              className="w-full h-9 pr-9 pl-3 rounded-xl text-sm bg-background border border-border/60 focus:outline-none text-right"
              autoFocus
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-4">
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map(s => (
              <button
                key={s.id}
                onClick={() => { onSelect(s.page); onClose(); }}
                className="flex items-center gap-2 p-2.5 rounded-xl text-right transition-all active:scale-[0.97] hover:bg-muted/40"
                style={{ border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(200,168,75,0.15)", color: "#c8a84b" }}>{s.id}</div>
                <div className="min-w-0">
                  <p className="font-semibold text-[12px] leading-tight">{s.name}</p>
                  <p className="text-[9px] text-muted-foreground">ص {s.page}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page Jump Input ───────────────────────────────────────────────────────────

function PageJumpSheet({ current, onSelect, onClose }: { current: number; onSelect: (page: number) => void; onClose: () => void }) {
  const [val, setVal] = useState(String(current));

  const go = () => {
    const n = parseInt(val);
    if (n >= 1 && n <= TOTAL_PAGES) { onSelect(n); onClose(); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-8"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xs bg-card rounded-2xl p-5"
        onClick={e => e.stopPropagation()}
      >
        <p className="font-bold text-center mb-4">الانتقال إلى صفحة</p>
        <input
          type="number" min={1} max={604} value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && go()}
          className="w-full h-12 text-center text-2xl font-bold rounded-xl bg-background border border-border focus:outline-none focus:border-amber-400/50"
          autoFocus
        />
        <p className="text-center text-[10px] text-muted-foreground mt-1 mb-4">١ — ٦٠٤</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground" style={{ background: "rgba(255,255,255,0.05)" }}>إلغاء</button>
          <button onClick={go} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: "rgba(200,168,75,0.2)", color: "#c8a84b", border: "1px solid rgba(200,168,75,0.35)" }}>انتقل</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function QuranReadPage() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState<number>(() => Math.max(1, Math.min(TOTAL_PAGES, parseInt(getStorage("quran_last_page", "1")) || 1)));
  const [zoom, setZoom] = useState<number>(1);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkFlash, setBookmarkFlash] = useState(false);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSurah = getSurahForPage(page);
  const currentJuz = getJuzForPage(page);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => { resetControlsTimer(); return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); }; }, []);

  useEffect(() => {
    setStorage("quran_last_page", String(page));
    setImgLoaded(false);
    setImgError(false);
    // check bookmark
    setBookmarked(isBookmarked(getSurahIdForPage(page), page));
  }, [page]);

  const goTo = (p: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_PAGES, p));
    setPage(clamped);
    resetControlsTimer();
  };

  const toggleBookmark = () => {
    const surahId = getSurahIdForPage(page);
    if (bookmarked) {
      // find and remove
      const bms = (() => { try { return JSON.parse(localStorage.getItem("quran_bookmarks") ?? "[]") as Array<{ id: string; surahId: number; ayahNum: number }>; } catch { return []; } })();
      const found = bms.find(b => b.surahId === surahId && b.ayahNum === page);
      if (found) removeBookmark(found.id);
      setBookmarked(false);
    } else {
      saveBookmark({ surahId, surahName: currentSurah, ayahNum: page, ayahText: `صفحة ${page} من المصحف الشريف`, note: "" });
      setBookmarked(true);
      setBookmarkFlash(true);
      setTimeout(() => setBookmarkFlash(false), 1500);
    }
    resetControlsTimer();
  };

  // Swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0]!.clientX, y: e.touches[0]!.clientY };
    resetControlsTimer();
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0]!.clientX - touchStart.current.x;
    const dy = Math.abs(e.changedTouches[0]!.clientY - touchStart.current.y);
    if (Math.abs(dx) > 60 && dy < 80) {
      if (dx < 0) goTo(page + 1); // swipe left → next page
      else goTo(page - 1);         // swipe right → prev page
    }
    touchStart.current = null;
  };

  const handleTap = () => resetControlsTimer();

  return (
    <div className="h-screen flex flex-col bg-[#1a1208] overflow-hidden" dir="rtl">
      {/* Top Bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 z-20"
            style={{ background: "rgba(10,8,5,0.92)", borderBottom: "1px solid rgba(200,168,75,0.15)", backdropFilter: "blur(12px)" }}
          >
            <div className="flex items-center justify-between px-4 py-2.5">
              <button onClick={() => setLocation("/quran")} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              <div className="flex-1 text-center">
                <p className="font-bold text-sm leading-tight" style={{ color: "#c8a84b", fontFamily: "'Amiri Quran', serif" }}>
                  سورة {currentSurah}
                </p>
                <p className="text-[10px] text-muted-foreground">الجزء {currentJuz} · صفحة {page}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={toggleBookmark} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{ background: bookmarked ? "rgba(200,168,75,0.2)" : "rgba(255,255,255,0.07)" }}>
                  {bookmarked ? <BookmarkCheck size={15} style={{ color: "#c8a84b" }} /> : <Bookmark size={15} className="text-muted-foreground" />}
                </button>
                <button onClick={() => setShowSurahPicker(true)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <List size={15} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Image */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        {/* Background parchment */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, #2a1f0d 0%, #1a1208 100%)" }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full h-full flex items-center justify-center"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          >
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  <p className="text-[11px] text-amber-400/60">جارٍ تحميل الصفحة {page}...</p>
                </div>
              </div>
            )}
            {imgError ? (
              <div className="flex flex-col items-center gap-3 px-8 text-center">
                <span className="text-4xl">📖</span>
                <p className="text-sm text-muted-foreground">تعذّر تحميل الصورة</p>
                <button
                  onClick={() => { setImgError(false); setImgLoaded(false); }}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold"
                  style={{ background: "rgba(200,168,75,0.15)", color: "#c8a84b" }}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <img
                src={pageImageUrl(page)}
                alt={`صفحة ${page} — سورة ${currentSurah}`}
                className="max-h-full max-w-full object-contain"
                style={{
                  display: imgLoaded ? "block" : "block",
                  opacity: imgLoaded ? 1 : 0,
                  transition: "opacity 0.3s",
                  filter: "brightness(0.97) contrast(1.05)",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  touchAction: "manipulation",
                }}
                onLoad={() => setImgLoaded(true)}
                onError={() => { setImgError(true); setImgLoaded(false); }}
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bookmark flash */}
        <AnimatePresence>
          {bookmarkFlash && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.85 }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl"
              style={{ background: "rgba(200,168,75,0.9)", color: "#1a0e00" }}
            >
              <p className="text-[12px] font-bold">✓ أُضيفت للمفضلة</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 z-20"
            style={{ background: "rgba(10,8,5,0.92)", borderTop: "1px solid rgba(200,168,75,0.12)", backdropFilter: "blur(12px)" }}
          >
            {/* Slider */}
            <div className="px-4 pt-3 pb-1">
              <input
                type="range" min={1} max={TOTAL_PAGES} value={page}
                onChange={e => goTo(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: "#c8a84b", background: `linear-gradient(to left, #c8a84b ${((page - 1) / (TOTAL_PAGES - 1)) * 100}%, rgba(255,255,255,0.1) 0%)` }}
                dir="ltr"
              />
            </div>

            {/* Nav row */}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-1.5">
                <button onClick={() => goTo(page - 10)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <SkipForward size={14} className="text-muted-foreground" />
                </button>
                <button onClick={() => goTo(page - 1)} disabled={page <= 1} className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all" style={{ background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.3)" }}>
                  <ChevronRight size={18} style={{ color: "#c8a84b" }} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowJump(true)} className="px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <span className="text-[12px] font-bold" style={{ color: "#c8a84b" }}>ص {page}</span>
                  <span className="text-[9px] text-muted-foreground mr-1">/ {TOTAL_PAGES}</span>
                </button>
                <button onClick={() => setShowJuzPicker(s => !s)} className="px-2.5 py-1.5 rounded-xl text-[11px]" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                  ج{currentJuz}
                </button>
                <button onClick={() => zoom < 2 ? setZoom(z => Math.min(2.5, z + 0.25)) : setZoom(1)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  {zoom > 1 ? <ZoomOut size={14} className="text-muted-foreground" /> : <ZoomIn size={14} className="text-muted-foreground" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={() => goTo(page + 1)} disabled={page >= TOTAL_PAGES} className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all" style={{ background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.3)" }}>
                  <ChevronLeft size={18} style={{ color: "#c8a84b" }} />
                </button>
                <button onClick={() => goTo(page + 10)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <SkipBack size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Juz quick nav */}
            <AnimatePresence>
              {showJuzPicker && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t" style={{ borderColor: "rgba(200,168,75,0.1)" }}>
                  <div className="px-3 py-2">
                    <p className="text-[10px] text-muted-foreground mb-2 text-center">اختر الجزء</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {JUZ_START_PAGES.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => { goTo(p); setShowJuzPicker(false); }}
                          className="w-8 h-8 rounded-lg text-[11px] font-bold transition-all active:scale-90"
                          style={{
                            background: currentJuz === i + 1 ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.05)",
                            color: currentJuz === i + 1 ? "#c8a84b" : "rgba(255,255,255,0.45)",
                            border: currentJuz === i + 1 ? "1px solid rgba(200,168,75,0.4)" : "1px solid transparent",
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sheets */}
      <AnimatePresence>
        {showSurahPicker && <SurahPickerSheet onSelect={p => goTo(p)} onClose={() => setShowSurahPicker(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showJump && <PageJumpSheet current={page} onSelect={p => goTo(p)} onClose={() => setShowJump(false)} />}
      </AnimatePresence>
    </div>
  );
}
