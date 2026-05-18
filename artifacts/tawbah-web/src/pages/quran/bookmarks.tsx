import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, Search, Share2, StickyNote, X, Check } from "lucide-react";
import { StandardHeader } from "@/components/header/StandardHeader";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuranBookmark {
  id: string;
  surahId: number;
  surahName: string;
  ayahNum: number;
  ayahText: string;
  note: string;
  savedAt: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function getBookmarks(): QuranBookmark[] {
  try { return JSON.parse(localStorage.getItem("quran_bookmarks") ?? "[]") as QuranBookmark[]; }
  catch { return []; }
}

export function saveBookmark(bm: Omit<QuranBookmark, "id" | "savedAt">): QuranBookmark {
  const bookmarks = getBookmarks();
  const existing = bookmarks.find(b => b.surahId === bm.surahId && b.ayahNum === bm.ayahNum);
  if (existing) return existing;
  const newBm: QuranBookmark = { ...bm, id: `${bm.surahId}_${bm.ayahNum}_${Date.now()}`, savedAt: new Date().toISOString() };
  bookmarks.unshift(newBm);
  try { localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks)); } catch {}
  return newBm;
}

export function removeBookmark(id: string) {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  try { localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks)); } catch {}
}

export function isBookmarked(surahId: number, ayahNum: number): boolean {
  return getBookmarks().some(b => b.surahId === surahId && b.ayahNum === ayahNum);
}

function updateNote(id: string, note: string) {
  const bookmarks = getBookmarks().map(b => b.id === id ? { ...b, note } : b);
  try { localStorage.setItem("quran_bookmarks", JSON.stringify(bookmarks)); } catch {}
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  } catch { return ""; }
}

// ─── Bookmark Card ────────────────────────────────────────────────────────────

function BookmarkCard({ bm, onDelete, onNoteUpdate }: { bm: QuranBookmark; onDelete: () => void; onNoteUpdate: (note: string) => void }) {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState(bm.note);
  const [noteSaved, setNoteSaved] = useState(false);

  const saveNote = () => {
    onNoteUpdate(noteText);
    setNoteSaved(true);
    setTimeout(() => { setNoteSaved(false); setShowNote(false); }, 1200);
  };

  const share = () => {
    const text = `﴿${bm.ayahText}﴾\n— سورة ${bm.surahName}، الآية ${bm.ayahNum}${bm.note ? `\n\n💭 ${bm.note}` : ""}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-[18px] overflow-hidden"
      style={{ background: "rgba(200,168,75,0.05)", border: "1px solid rgba(200,168,75,0.18)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(200,168,75,0.1)" }}>
        <div className="flex items-center gap-2">
          <Bookmark size={12} style={{ color: "#c8a84b" }} fill="#c8a84b" />
          <span className="text-[11px] font-bold" style={{ color: "#c8a84b" }}>سورة {bm.surahName} — الآية {bm.ayahNum}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={share} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
            <Share2 size={11} style={{ color: "#3b82f6" }} />
          </button>
          <button onClick={() => setShowNote(s => !s)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
            <StickyNote size={11} style={{ color: "#f59e0b" }} />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
            <Trash2 size={11} style={{ color: "#ef4444" }} />
          </button>
        </div>
      </div>

      {/* Ayah text */}
      <div className="px-4 py-3">
        <p
          className="text-right leading-[2.2]"
          style={{ fontFamily: "'Amiri Quran', serif", fontSize: 18, color: "rgba(255,255,255,0.92)" }}
          dir="rtl"
        >
          ﴿{bm.ayahText}﴾
        </p>
        {bm.note && !showNote && (
          <p className="text-[11px] text-amber-500/80 mt-2 text-right border-r-2 pr-2" style={{ borderColor: "#f59e0b" }}>
            💭 {bm.note}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1.5 text-left">{formatDate(bm.savedAt)}</p>
      </div>

      {/* Note editor */}
      <AnimatePresence>
        {showNote && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 border-t" style={{ borderColor: "rgba(200,168,75,0.1)" }}>
              <p className="text-[10px] text-muted-foreground mt-2 mb-1.5">تأمل أو ملاحظة شخصية:</p>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="اكتب تأملك في هذه الآية..."
                rows={3}
                dir="rtl"
                className="w-full px-3 py-2 rounded-xl text-sm bg-card border border-border/60 focus:outline-none focus:border-amber-400/50 resize-none text-right"
              />
              <button
                onClick={saveNote}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                style={{ background: noteSaved ? "rgba(16,185,129,0.2)" : "rgba(200,168,75,0.15)", color: noteSaved ? "#10b981" : "#c8a84b", border: `1px solid ${noteSaved ? "rgba(16,185,129,0.3)" : "rgba(200,168,75,0.3)"}` }}
              >
                {noteSaved ? <><Check size={11} /> حُفظ</> : "حفظ التأمل"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => getBookmarks());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "noted">("all");

  const refresh = () => setBookmarks(getBookmarks());

  const filtered = bookmarks.filter(b => {
    const matchSearch = !search || b.surahName.includes(search) || b.ayahText.includes(search) || b.note.includes(search);
    const matchFilter = filter === "all" || (filter === "noted" && b.note.length > 0);
    return matchSearch && matchFilter;
  });

  const handleDelete = (id: string) => {
    removeBookmark(id);
    refresh();
  };

  const handleNoteUpdate = (id: string, note: string) => {
    updateNote(id, note);
    refresh();
  };

  return (
    <div className="min-h-screen pb-28" dir="rtl">
      <StandardHeader title="المفضلة القرآنية" subtitle={`${bookmarks.length} آية محفوظة`} showBack />
      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في محفوظاتك..."
              dir="rtl"
              className="w-full h-9 pr-9 pl-3 rounded-xl text-sm bg-card border border-border/60 focus:outline-none focus:border-amber-400/50 text-right"
            />
          </div>
          <div className="flex gap-1">
            {([["all", "الكل"], ["noted", "بتأملات"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: filter === id ? "rgba(200,168,75,0.2)" : "rgba(255,255,255,0.05)",
                  color: filter === id ? "#c8a84b" : "rgba(255,255,255,0.5)",
                  border: filter === id ? "1px solid rgba(200,168,75,0.35)" : "1px solid transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-5xl">📌</span>
            <p className="font-bold text-base text-center">{search ? "لا نتائج" : "لا توجد آيات محفوظة"}</p>
            <p className="text-[12px] text-muted-foreground text-center px-8">
              {search ? "جرّب كلمة بحث مختلفة" : "عند قراءة القرآن، اضغط على أي آية وأضفها إلى مفضلتك"}
            </p>
          </div>
        )}

        {/* Bookmark list */}
        <AnimatePresence>
          {filtered.map(bm => (
            <BookmarkCard
              key={bm.id}
              bm={bm}
              onDelete={() => handleDelete(bm.id)}
              onNoteUpdate={(note) => handleNoteUpdate(bm.id, note)}
            />
          ))}
        </AnimatePresence>

        {bookmarks.length > 0 && filtered.length > 0 && (
          <p className="text-center text-[10px] text-muted-foreground pb-2">
            {filtered.length} آية من {bookmarks.length}
          </p>
        )}
      </div>
    </div>
  );
}
