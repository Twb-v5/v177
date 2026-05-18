import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Check, Loader2 } from "lucide-react";
import { useSettings, QURAN_RECITERS } from "@/context/SettingsContext";
import { getApiBase } from "@/lib/api-base";
import { Surah, AlQuranAyah, AlQuranResponse, activeQuranAudio, setActiveQuranAudio } from "./quranData";
import { MushafDisplay } from "./MushafDisplay";

export function SurahReaderSheet({
  surah,
  onClose,
}: {
  surah: Surah;
  onClose: () => void;
}) {
  const { quranReciterId, setQuranReciterId } = useSettings();
  const [ayahs, setAyahs] = useState<AlQuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setAyahs([]);
    fetch(`${getApiBase()}/quran/surah/${surah.id}`)
      .then((r) => r.json())
      .then((data: AlQuranResponse) => {
        if (data.code === 200 && data.data?.ayahs) {
          setAyahs(data.data.ayahs);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [surah.id]);

  useEffect(() => {
    return () => {
      if (activeQuranAudio) {
        activeQuranAudio.stop();
        setActiveQuranAudio(null);
      }
    };
  }, []);

  const currentReciter = QURAN_RECITERS.find((r) => r.id === quranReciterId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-full max-w-md bg-card rounded-t-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ borderColor: "rgba(200,168,75,0.15)" }}
        >
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
          <div className="text-center">
            <p
              className="font-bold text-base"
              style={{ fontFamily: "'Amiri Quran', serif", color: "#c8a84b" }}
            >
              سورة {surah.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {surah.ayahCount} آية · {surah.revelation} · الجزء {surah.juz}
            </p>
          </div>
          <button
            onClick={() => setShowReciterPicker((s) => !s)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-colors"
            style={{ background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.25)" }}
          >
            <Volume2 size={12} style={{ color: "#c8a84b" }} />
            <span className="text-[10px] font-bold" style={{ color: "#c8a84b" }}>
              {currentReciter?.nameAr.split(" ")[0]}
            </span>
          </button>
        </div>

        {/* Reciter Picker */}
        <AnimatePresence>
          {showReciterPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden shrink-0 border-b"
              style={{ borderColor: "rgba(200,168,75,0.1)" }}
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {QURAN_RECITERS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setQuranReciterId(r.id); setShowReciterPicker(false); }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-right transition-colors"
                    style={{
                      background: quranReciterId === r.id ? "rgba(200,168,75,0.15)" : "transparent",
                      border: quranReciterId === r.id ? "1px solid rgba(200,168,75,0.3)" : "1px solid transparent",
                    }}
                  >
                    <span className="text-[11px] text-muted-foreground">{r.nameAr}</span>
                    {quranReciterId === r.id && <Check size={13} style={{ color: "#c8a84b" }} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bismillah */}
        {surah.id !== 1 && surah.id !== 9 && (
          <div
            className="px-5 py-4 text-center border-b shrink-0"
            style={{ borderColor: "rgba(200,168,75,0.1)" }}
          >
            <p style={{ fontFamily: "'Amiri Quran', 'Scheherazade New', serif", fontSize: 20, color: "rgba(200,168,75,0.9)" }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayahs content */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={28} className="animate-spin" style={{ color: "#c8a84b" }} />
              <p className="text-sm text-muted-foreground">جارٍ تحميل السورة...</p>
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-muted-foreground">تعذّر التحميل — تحقق من اتصالك</p>
            </div>
          )}
          {!loading && !error && ayahs.length > 0 && (
            <MushafDisplay surahId={surah.id} ayahs={ayahs} reciterId={quranReciterId} />
          )}
          <div className="h-8 mt-[45px] mb-[45px]" />
        </div>
      </motion.div>
    </motion.div>
  );
}
