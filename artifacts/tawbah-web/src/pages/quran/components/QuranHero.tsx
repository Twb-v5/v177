import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function QuranHero() {
  const [activeAyahIdx, setActiveAyahIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveAyahIdx((i) => (i + 1) % 4), 6000);
    return () => clearInterval(t);
  }, []);

  const ayahs = [
    { text: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ", ref: "الإسراء: ٩" },
    { text: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ", ref: "الإسراء: ٨٢" },
    { text: "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ", ref: "ص: ٢٩" },
    { text: "لَوْ أَنزَلْنَا هَٰذَا الْقُرْآنَ عَلَىٰ جَبَلٍ لَّرَأَيْتَهُ خَاشِعًا", ref: "الحشر: ٢١" },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[28px] mx-0"
      style={{
        background: "linear-gradient(160deg, #040d18 0%, #071428 40%, #030b15 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      {/* Particle stars */}
      {[
        [12, 8], [88, 5], [35, 15], [65, 7], [90, 18], [20, 22], [75, 12],
        [50, 4], [42, 20], [80, 24], [15, 28], [58, 10], [30, 3], [70, 26],
        [95, 8], [5, 18],
      ].map(([x, y], i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: i % 4 === 0 ? 2.5 : 1.5,
            height: i % 4 === 0 ? 2.5 : 1.5,
            background: i % 3 === 0 ? "#c8a84b" : i % 3 === 1 ? "#7dd3fc" : "#ffffff",
          }}
          animate={{ opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 2.5 + (i % 5) * 0.8, repeat: Infinity, delay: (i * 0.35) % 4 }}
        />
      ))}

      {/* Top glow */}
      <div
        className="absolute inset-x-0 top-0 h-[180px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(200,168,75,0.22) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative z-10 px-5 pt-7 pb-6">
        {/* Arabic calligraphy icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(200,168,75,0.25) 0%, rgba(200,168,75,0.08) 100%)",
              border: "1px solid rgba(200,168,75,0.4)",
              boxShadow: "0 0 30px rgba(200,168,75,0.2)",
            }}
          >
            <span style={{ fontSize: 32 }}>📖</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center font-bold leading-tight mb-[16px] pt-[11px] pb-[11px]"
          style={{
            fontSize: 28,
            background: "linear-gradient(180deg, #ffffff 0%, #c8a84b 60%, #a07c2a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "'Amiri Quran', serif",
          }}
        >
          القرآن الكريم
        </h1>
        <p className="text-center text-[11px] mb-5" style={{ color: "rgba(200,168,75,0.6)" }}>
          مكتبة القرآن الشاملة — تلاوة · تفسير · علوم · إعجاز
        </p>

        {/* Rotating ayah */}
        <div
          className="rounded-2xl px-4 py-4 mb-5"
          style={{ background: "rgba(200,168,75,0.07)", border: "1px solid rgba(200,168,75,0.2)" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAyahIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <p
                className="text-center leading-loose mb-2"
                style={{ color: "rgba(255,255,255,0.92)", fontFamily: "'Amiri Quran', serif", fontSize: 16 }}
              >
                ﴿{ayahs[activeAyahIdx]!.text}﴾
              </p>
              <p className="text-center text-[11px]" style={{ color: "rgba(200,168,75,0.7)" }}>
                — {ayahs[activeAyahIdx]!.ref}
              </p>
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {ayahs.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveAyahIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === activeAyahIdx ? 20 : 6,
                  height: 6,
                  background: i === activeAyahIdx ? "#c8a84b" : "rgba(200,168,75,0.25)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: "١١٤", label: "سورة" },
            { num: "٦٢٣٦", label: "آية" },
            { num: "٣٠", label: "جزءاً" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-2.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span
                className="font-bold"
                style={{ fontSize: 18, color: "#c8a84b", fontFamily: "'Amiri Quran', serif" }}
              >
                {s.num}
              </span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
