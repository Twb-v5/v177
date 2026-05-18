import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  Zap,
  Sparkles,
  Sun,
  Star,
  Brain,
  BookMarked,
} from "lucide-react";
import { Link } from "wouter";
import { StandardHeader } from "@/components/header/StandardHeader";
import { Surah } from "./components/quranData";
import { QuranHero } from "./components/QuranHero";
import { DailyAyahCard } from "./components/DailyAyahCard";
import { SurahBrowser } from "./components/SurahBrowser";
import { SurahReaderSheet } from "./components/SurahReaderSheet";
import { MiraclesSection } from "./components/MiraclesSection";
import { SciencesGrid } from "./components/SciencesGrid";
import { VirtuesSection } from "./components/VirtuesSection";
import { ReadingTracker } from "./components/ReadingTracker";
import { SectionTitle } from "./components/SectionTitle";
import { QuickActions } from "./components/QuickActions";

export default function QuranPage() {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  const quranNavItems = [
    { icon: "📖", label: "القراءة", sub: "تصفح السور", href: "/quran/read" },
    { icon: "🔊", label: "الاستماع", sub: "مع ترتيل", href: "/quran/listen" },
    { icon: "🧠", label: "الحفظ", sub: "مساعد الحفظ", href: "/quran/memorize" },
    { icon: "💡", label: "التفسير", sub: "معاني الآيات", href: "/quran/tafsir" },
    { icon: "🤲", label: "التجويد", sub: "أحكام التجويد", href: "/quran/tajweed" },
    { icon: "🤖", label: "مساعد القرآن", sub: "الذكاء الاصطناعي", href: "/quran/ai" },
    { icon: "📅", label: "الختمات", sub: "ختمات تاريخية", href: "/quran/khatmat" },
    { icon: "👥", label: "الختمة الجماعية", sub: "مع أصدقائك", href: "/quran/khatma" },
    { icon: "🔥", label: "التحديات", sub: "تحدّ نفسك", href: "/quran/challenges" },
  ];

  const newFeatures = [
    { icon: "👥", label: "الختمة الجماعية", sub: "اختم مع أصدقائك", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)", href: "/quran/khatma" },
    { icon: "🔥", label: "تحديات القرآن", sub: "تحدّ نفسك", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", href: "/quran/challenges" },
    { icon: "🗺️", label: "خريطة القرآن", sub: "استكشف البنية", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.2)", href: "/quran/map" },
    { icon: "🤖", label: "مساعد القرآن", sub: "اسأل بالذكاء الاصطناعي", color: "#ec4899", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.2)", href: "/quran/ai" },
    { icon: "🎨", label: "بطاقات القرآن", sub: "أنشئ وشارك", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", href: "/quran/cards" },
    { icon: "📅", label: "الختمات التاريخية", sub: "رمضان · ذو الحجة", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.2)", href: "/quran/khatmat" },
  ];

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      <StandardHeader
        title="القرآن الكريم"
        subtitle="مكتبة شاملة"
        showBack
        right={
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-primary hover:bg-primary/10 active:scale-95 transition-all border border-primary/30"
            aria-label="قائمة القرآن"
          >
            <span>أقسام</span>
            <ChevronDown size={12} className={`transition-transform ${navOpen ? "rotate-180" : ""}`} />
          </button>
        }
      />

      {/* Quran nav sheet */}
      {navOpen && (
        <div
          className="mx-4 mb-2 mt-1 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-md shadow-lg overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
        >
          <div className="grid grid-cols-3 gap-0 divide-x divide-y divide-border/40 rtl:divide-x-reverse">
            {quranNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className="flex flex-col items-center gap-1 px-2 py-3 text-center hover:bg-primary/5 active:bg-primary/10 transition-colors"
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[11px] font-bold text-foreground leading-tight">{item.label}</span>
                <span className="text-[9px] text-muted-foreground leading-none">{item.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 flex flex-col gap-6 pt-4">
        {/* Hero */}
        <QuranHero />

        {/* Quick Actions */}
        <div>
          <SectionTitle
            icon={<Zap size={16} />}
            title="ابدأ الآن"
            sub="تلاوة · بحث · حفظ · استماع"
          />
          <QuickActions />
        </div>

        {/* New Features Grid */}
        <div>
          <SectionTitle
            icon={<Sparkles size={16} />}
            title="ميزات جديدة"
            sub="مجتمع · ذكاء · إبداع"
            accent="#8b5cf6"
          />
          <div className="grid grid-cols-2 gap-2">
            {newFeatures.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2.5 p-3 rounded-2xl active:scale-[0.97] transition-all"
                style={{ background: a.bg, border: `1px solid ${a.border}` }}
              >
                <span className="text-xl shrink-0">{a.icon}</span>
                <div className="min-w-0">
                  <p className="font-bold text-[12px] leading-tight" style={{ color: a.color }}>
                    {a.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{a.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Daily Ayah */}
        <div>
          <SectionTitle
            icon={<Sun size={16} />}
            title="آية اليوم"
            sub="مع التفسير الميسّر"
            accent="#10b981"
          />
          <DailyAyahCard />
        </div>

        {/* Reading Tracker */}
        <div>
          <SectionTitle
            icon={<BookMarked size={16} />}
            title="ورد القرآن"
            sub="تتبع قراءتك اليومية"
          />
          <ReadingTracker />
        </div>

        {/* Surah Browser */}
        <div>
          <SectionTitle
            icon={<BookOpen size={16} />}
            title="استعرض السور"
            sub="١١٤ سورة — انقر للقراءة والاستماع"
          />
          <SurahBrowser onSelect={setSelectedSurah} />
        </div>

        {/* Sciences */}
        <div>
          <SectionTitle
            icon={<Brain size={16} />}
            title="علوم القرآن"
            sub="رحلة في العلم القرآني"
            accent="#8b5cf6"
          />
          <SciencesGrid />
        </div>

        {/* Miracles */}
        <div>
          <SectionTitle
            icon={<Sparkles size={16} />}
            title="إعجاز القرآن"
            sub="حقائق تُذهل العقول"
            accent="#f59e0b"
          />
          <MiraclesSection />
        </div>

        {/* Virtues */}
        <div>
          <SectionTitle
            icon={<Star size={16} />}
            title="فضل القرآن"
            sub="أحاديث نبوية شريفة"
            accent="#c8a84b"
          />
          <VirtuesSection />
        </div>

        {/* Bottom CTA */}
        <div
          className="rounded-[22px] p-5 text-center"
          style={{
            background: "linear-gradient(145deg, rgba(200,168,75,0.12) 0%, rgba(200,168,75,0.04) 100%)",
            border: "1px solid rgba(200,168,75,0.25)",
          }}
        >
          <p
            className="text-[22px] font-bold mb-1 leading-relaxed"
            style={{ fontFamily: "'Amiri Quran', serif", color: "#c8a84b" }}
          >
            ﴿وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا﴾
          </p>
          <p className="text-[11px] text-muted-foreground mb-4">المزمل: ٤</p>
          <a
            href="https://quran.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm active:scale-[0.97] transition-all"
            style={{
              background: "linear-gradient(135deg, #c8a84b, #a07c2a)",
              color: "#1a0e00",
              boxShadow: "0 4px 16px rgba(200,168,75,0.35)",
            }}
          >
            <BookOpen size={15} />
            افتح مصحف quran.com
          </a>
        </div>
      </div>

      {/* In-App Surah Reader Sheet */}
      <AnimatePresence>
        {selectedSurah && (
          <SurahReaderSheet
            surah={selectedSurah}
            onClose={() => setSelectedSurah(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
