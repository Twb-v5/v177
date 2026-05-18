import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, X } from "lucide-react";
import { AlQuranAyah, cdnAudioUrl, toEasternArabic, activeQuranAudio, setActiveQuranAudio } from "./quranData";

export function MushafDisplay({
  surahId,
  ayahs,
  reciterId,
}: {
  surahId: number;
  ayahs: AlQuranAyah[];
  reciterId: string;
}) {
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const preloadedIdxRef = useRef<number | null>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const playIdxRef = useRef<(idx: number) => void>(() => {});

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.src = "";
    }
    if (preloadRef.current) {
      preloadRef.current.pause();
      preloadRef.current.src = "";
    }
    preloadedIdxRef.current = null;
    setPlayingIdx(null);
    setIsPlaying(false);
    if (activeQuranAudio) setActiveQuranAudio(null);
  }, []);

  const preloadIdx = useCallback(
    (idx: number) => {
      const ayah = ayahs[idx];
      if (!ayah) return;
      if (!preloadRef.current) preloadRef.current = new Audio();
      const pre = preloadRef.current;
      pre.pause();
      pre.onended = null;
      pre.preload = "auto";
      pre.src = cdnAudioUrl(surahId, ayah.numberInSurah, reciterId);
      pre.load();
      preloadedIdxRef.current = idx;
      pre.volume = 0;
      pre.play().then(() => { pre.pause(); pre.currentTime = 0; pre.volume = 1; }).catch(() => { pre.volume = 1; });
    },
    [ayahs, surahId, reciterId],
  );

  const playIdx = useCallback(
    (idx: number) => {
      const ayah = ayahs[idx];
      if (!ayah) return;

      if (preloadedIdxRef.current === idx && preloadRef.current && preloadRef.current.src) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; }
        const pre = preloadRef.current;
        pre.volume = 1;
        pre.currentTime = 0;
        audioRef.current = pre;
        preloadRef.current = new Audio();
        preloadedIdxRef.current = null;
      } else {
        if (!audioRef.current) audioRef.current = new Audio();
        const audio = audioRef.current;
        audio.pause();
        audio.onended = null;
        audio.src = cdnAudioUrl(surahId, ayah.numberInSurah, reciterId);
        audio.load();
      }

      const audio = audioRef.current;
      audio.play().catch(() => {});
      setActiveQuranAudio({ element: audio, stop: stopAudio });
      setPlayingIdx(idx);
      setIsPlaying(true);
      spanRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });

      const next = idx + 1;
      if (next < ayahs.length) preloadIdx(next);

      audio.onended = () => {
        if (next < ayahs.length) {
          playIdxRef.current(next);
        } else {
          setPlayingIdx(null);
          setIsPlaying(false);
        }
      };
    },
    [ayahs, surahId, reciterId, stopAudio, preloadIdx],
  );

  useEffect(() => { playIdxRef.current = playIdx; }, [playIdx]);

  const handleAyahTap = (idx: number) => {
    if (playingIdx === idx && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setActiveQuranAudio(null);
    } else {
      playIdx(idx);
    }
  };

  useEffect(() => { return () => stopAudio(); }, [stopAudio]);

  return (
    <div className="px-5 py-5">
      {/* Controls row */}
      <div
        className="flex items-center justify-between mb-4 pb-3 border-b"
        style={{ borderColor: "rgba(200,168,75,0.12)" }}
      >
        <button
          onClick={() =>
            isPlaying
              ? (audioRef.current?.pause(), setIsPlaying(false))
              : playingIdx !== null
                ? (audioRef.current?.play(), setIsPlaying(true))
                : playIdx(0)
          }
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all active:scale-95"
          style={{ background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.25)", color: "#c8a84b" }}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          {isPlaying ? "إيقاف" : playingIdx !== null ? "متابعة" : "تشغيل الكل"}
        </button>
        {playingIdx !== null && (
          <button
            onClick={stopAudio}
            className="text-[11px] text-muted-foreground px-2 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <X size={13} />
          </button>
        )}
        <p className="text-[11px] text-muted-foreground">اضغط على أي آية للاستماع</p>
      </div>

      {/* Continuous mushaf text */}
      <p
        className="leading-[3] text-right"
        style={{
          fontFamily: "'Amiri Quran', 'Scheherazade New', 'KFGQPC Uthmanic Script HAFS', serif",
          fontSize: 21,
          direction: "rtl",
          textAlign: "justify",
          color: "var(--foreground)",
          wordSpacing: "0.05em",
        }}
        dir="rtl"
      >
        {ayahs.map((ayah, idx) => (
          <span key={ayah.numberInSurah}>
            <span
              ref={(el) => { spanRefs.current[idx] = el; }}
              onClick={() => handleAyahTap(idx)}
              className="cursor-pointer rounded transition-all"
              style={{
                background: playingIdx === idx ? "rgba(200,168,75,0.22)" : "transparent",
                color: playingIdx === idx ? "#c8a84b" : "inherit",
                boxShadow: playingIdx === idx ? "0 0 0 2px rgba(200,168,75,0.2)" : "none",
                borderRadius: 6,
                padding: "1px 2px",
              }}
            >
              {ayah.text}
            </span>{" "}
            <span
              className="inline-flex items-center justify-center"
              style={{
                fontFamily: "'Amiri Quran', serif",
                fontSize: 15,
                color: playingIdx === idx ? "#c8a84b" : "rgba(200,168,75,0.75)",
                letterSpacing: 0,
              }}
            >
              ﴿{toEasternArabic(ayah.numberInSurah)}﴾
            </span>{" "}
          </span>
        ))}
      </p>
    </div>
  );
}
