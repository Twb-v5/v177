import { Link } from "wouter";
import {
  ArrowLeft,
  Heart,
  CircleDot,
  BookOpen,
  PenLine,
  ScrollText,
  Clock,
  BarChart2,
  ListChecks,
  Swords,
  Globe,
  CalendarDays,
  Bell,
  HandHeart,
  ImageIcon,
  Users,
  Bot,
  Sparkles,
  Mic,
  BrainCircuit,
} from "lucide-react";
import { SoulMeter } from "@/components/SoulMeter";
import { LiveStats } from "@/components/live-stats";
import { SectionGarden } from "./GardenSection";
import { InviteFriendCard } from "./InviteFriendCard";
import { SectionJourneyCard } from "./JourneyCard";
import { SectionQuranCard } from "./QuranCard";
import { SectionHadithCard } from "./HadithCard";
import type { ListId } from "./types";

// ─── Re-export for convenience ────────────────────────────────────────────────

export { SectionGarden };
export { SectionJourneyCard };

// ─── Section label map ────────────────────────────────────────────────────────

export const SECTION_LABELS: Record<ListId, string> = {
  "quran-card": "القرآن الكريم",
  "hadith-card": "الحديث الشريف",
  "soul-meter": "مقياس الروح",
  "journey-card": "رحلة التوبة ٣٠ يوماً",
  journey30: "رحلة ٣٠ يوماً",
  invite: "ادعُ رفيقاً",
  ameen: "قل آمين",
  "tawbah-card": "بطاقة توبتي",
  signs: "تباشير القبول",
  map: "خريطة التوبة",
  "live-stats": "إحصاءات حية",
  "islamic-programs": "برامج إسلامية",
  garden: "شجرة التوبة",
  munajat: "وضع المناجاة",
  adhkar: "الأذكار والأدعية",
  "zakiy-card": "البوت الزكي",
};

// ─── Individual section components ────────────────────────────────────────────

export function SectionSoulMeter() {
  return <SoulMeter />;
}

export function SectionInvite() {
  return <InviteFriendCard />;
}

export function SectionLiveStats() {
  return <LiveStats />;
}

export function SectionTawbahCard() {
  return (
    <Link
      href="/card"
      className="flex items-center gap-4 bg-gradient-to-l from-amber-500/10 to-primary/10 border border-amber-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shrink-0">
        <ImageIcon size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">بطاقة توبتي</h3>
        <p className="text-[11px] text-muted-foreground">
          اصنع بطاقة جميلة وشاركها مع الناس
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionMap() {
  return (
    <Link
      href="/map"
      className="flex items-center gap-4 bg-gradient-to-l from-blue-500/10 to-primary/10 border border-blue-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shrink-0">
        <Globe size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">خريطة التوبة العالمية</h3>
        <p className="text-[11px] text-muted-foreground">
          من أي دول يتوب المسلمون الآن؟
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionJourney30() {
  const dayNumber = (() => {
    try {
      return parseInt(localStorage.getItem("journey_day") ?? "1") || 1;
    } catch {
      return 1;
    }
  })();
  const progress = Math.min(Math.round((dayNumber / 30) * 100), 100);

  return (
    <Link
      href="/journey"
      className="block rounded-[22px] overflow-hidden active:scale-[0.97] transition-transform relative"
      style={{
        background:
          "linear-gradient(135deg, #120a2e 0%, #1e1048 45%, #2d1060 100%)",
        border: "1px solid rgba(167,139,250,0.32)",
        boxShadow:
          "0 10px 36px rgba(109,40,217,0.22), 0 3px 10px rgba(0,0,0,0.35)",
      }}
    >
      {/* Glow */}
      <div
        className="absolute -top-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-[54px] h-[54px] rounded-[16px] flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(109,40,217,0.5) 100%)",
              border: "1px solid rgba(167,139,250,0.4)",
              boxShadow: "0 0 18px rgba(139,92,246,0.3)",
            }}
          >
            <CalendarDays size={24} style={{ color: "#c4b5fd" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                رحلة التوبة ٣٠ يوماً
              </h3>
              <span
                className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(167,139,250,0.2)",
                  border: "1px solid rgba(167,139,250,0.35)",
                  color: "#c4b5fd",
                }}
              >
                اليوم {dayNumber}/٣٠
              </span>
            </div>
            <p
              style={{
                fontSize: 10.5,
                color: "rgba(196,181,253,0.6)",
                marginBottom: 8,
              }}
            >
              برنامج تدريجي يومي للتوبة والاستقامة
            </p>
            {/* Progress bar */}
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)",
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SectionAmeen() {
  return (
    <Link
      href="/ameen"
      className="flex items-center gap-4 bg-gradient-to-l from-rose-500/10 to-pink-500/5 border border-rose-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-md shrink-0">
        <HandHeart size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">قل آمين 🤲</h3>
        <p className="text-[11px] text-muted-foreground">
          ادعُ لأخٍ مجهول — وقل آمين لدعائه
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionSigns() {
  return (
    <Link
      href="/signs"
      className="flex items-center gap-4 bg-card border border-green-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 text-green-500">
        <HeartHandshake size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">تباشير القبول</h3>
        <p className="text-[11px] text-muted-foreground">
          علامات قبول التوبة الصادقة
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionIslamicPrograms() {
  return (
    <Link
      href="/islamic-programs"
      className="flex items-center gap-4 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
      }}
    >
      <div className="absolute top-[-20px] left-[-20px] w-[90px] h-[90px] rounded-full opacity-15 bg-white pointer-events-none" />
      <div className="absolute bottom-[-30px] right-[30%] w-[80px] h-[80px] rounded-full opacity-10 bg-white pointer-events-none" />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}
      >
        📺
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-[15px]" style={{ color: "#fff" }}>
          برامج إسلامية
        </h3>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
          50 برنامج • تفسير · دعوة · فتاوى · سيرة · إذاعة
        </p>
      </div>
      <div className="flex gap-1 shrink-0">
        {["📖", "🤝", "🎬"].map((icon, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            {icon}
          </div>
        ))}
      </div>
      <ArrowLeft size={16} style={{ color: "rgba(255,255,255,0.5)" }} className="shrink-0" />
    </Link>
  );
}

export function SectionMunajat() {
  const hour = new Date().getHours();
  const isAfterIsha = hour >= 20 || hour < 4;
  return (
    <Link
      href="/munajat"
      className="flex items-center gap-4 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #0c0a1e 0%, #1e1b4b 50%, #1a1040 100%)",
        border: "1px solid rgba(139,92,246,0.3)",
      }}
    >
      <div className="absolute top-[-15px] left-[-15px] w-[80px] h-[80px] rounded-full opacity-10 bg-white pointer-events-none" />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
        style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)" }}
      >
        🌙
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-[15px]" style={{ color: "#fff" }}>
          وضع المناجاة
        </h3>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(200,180,255,0.65)" }}>
          {isAfterIsha ? "⭐ الليل — وقت المناجاة" : "شاشة هادئة • صوت أمبيانت • ذكر"}
        </p>
      </div>
      <ArrowLeft size={16} style={{ color: "rgba(200,180,255,0.4)" }} className="shrink-0" />
    </Link>
  );
}

export function SectionAdhkar() {
  return (
    <Link
      href="/adhkar"
      className="flex items-center gap-4 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #0d1f1a 0%, #0a2218 50%, #071a14 100%)",
        border: "1px solid rgba(52,211,153,0.28)",
      }}
    >
      <div
        className="absolute top-[-15px] right-[-15px] w-[80px] h-[80px] rounded-full pointer-events-none"
        style={{ background: "rgba(52,211,153,0.15)", filter: "blur(16px)" }}
      />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
        style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}
      >
        📿
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-[15px]" style={{ color: "#6ee7b7" }}>
          الأذكار والأدعية
        </h3>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(110,231,183,0.55)" }}>
          ٢٨ قسماً شاملاً — صباح ومساء وصلاة وحياة
        </p>
      </div>
      <ArrowLeft size={16} style={{ color: "rgba(110,231,183,0.35)" }} className="shrink-0" />
    </Link>
  );
}

// Grid-ID based link sections (rendered as list items in list context)

export function SectionRajaa() {
  return (
    <Link
      href="/rajaa"
      className="flex items-center gap-4 bg-card border border-primary/20 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        <BookOpen size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">مكتبة الرجاء</h3>
        <p className="text-[11px] text-muted-foreground">
          آيات وأحاديث وقصص تبعث الأمل
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionDhikr() {
  return (
    <Link
      href="/dhikr"
      className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0 text-secondary-foreground">
        <CircleDot size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">مسبحة الذكر</h3>
        <p className="text-[11px] text-muted-foreground">
          استغفار وتسبيح بين يديك
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionJournal() {
  return (
    <Link
      href="/journal"
      className="flex items-center gap-4 bg-card border border-violet-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 text-violet-500">
        <PenLine size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">يوميات التوبة</h3>
        <p className="text-[11px] text-muted-foreground">مساحة سرية خاصة بك</p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionKaffarah() {
  return (
    <Link
      href="/kaffarah"
      className="flex items-center gap-4 bg-card border border-destructive/20 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 text-destructive">
        <ScrollText size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">الكفارات الشرعية</h3>
        <p className="text-[11px] text-muted-foreground">
          خطوات مفصّلة لكل ذنب
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionProgressMap() {
  return (
    <Link
      href="/progress"
      className="flex items-center gap-4 bg-card border border-blue-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
        <BarChart2 size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">خريطة التقدم</h3>
        <p className="text-[11px] text-muted-foreground">
          إحصاءاتك الروحية ومسيرتك
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionHadiTasks() {
  return (
    <Link
      href="/hadi-tasks"
      className="flex items-center gap-4 bg-card border border-emerald-300/40 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600">
        <ListChecks size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">مهام هادي</h3>
        <p className="text-[11px] text-muted-foreground">
          نصائح الزكي تتحول لمهام تتابعها
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionDhikrRooms() {
  return (
    <Link
      href="/dhikr-rooms"
      className="flex items-center gap-4 bg-gradient-to-l from-teal-500/10 to-primary/10 border border-teal-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-md shrink-0">
        <Users size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">غرف الذكر الجماعي</h3>
        <p className="text-[11px] text-muted-foreground">
          سبّح مع آلاف المسلمين الآن
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionPrayerTimes() {
  return (
    <Link
      href="/prayer-times"
      className="flex items-center gap-4 bg-card border border-indigo-300/40 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500">
        <Clock size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">مواقيت الصلاة</h3>
        <p className="text-[11px] text-muted-foreground">
          تذكيرات ذكية قبل كل صلاة
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionRelapse() {
  return (
    <Link
      href="/relapse"
      className="flex items-center gap-4 bg-card border border-rose-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-500">
        <Heart size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">ضعفت وعدت؟</h3>
        <p className="text-[11px] text-muted-foreground">
          اقرأ هذا فوراً — لا تيأس
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionNotifications() {
  return (
    <Link
      href="/notifications"
      className="flex items-center gap-4 bg-card border border-amber-300/40 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-500">
        <Bell size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">الإشعارات</h3>
        <p className="text-[11px] text-muted-foreground">
          ضبط تنبيهات الصلاة والأذكار
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionDangerTimes() {
  return (
    <Link
      href="/danger-times"
      className="flex items-center gap-4 bg-card border border-orange-400/25 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500">
        <Clock size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">أوقات الخطر</h3>
        <p className="text-[11px] text-muted-foreground">تذكيرات وقائية ذكية</p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionSecretDua() {
  return (
    <Link
      href="/secret-dua"
      className="flex items-center gap-4 bg-card border border-rose-300/40 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-500">
        <Heart size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">الصديق السري</h3>
        <p className="text-[11px] text-muted-foreground">
          ادعُ لأخٍ مجهول بلا أسماء
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

export function SectionDuaTiming() {
  return (
    <Link
      href="/dua-timing"
      className="flex items-center gap-4 bg-card border border-yellow-300/40 rounded-2xl p-4 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 text-yellow-600">
        <Swords size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">لحظة الإجابة</h3>
        <p className="text-[11px] text-muted-foreground">
          أقوى أوقات الدعاء
        </p>
      </div>
      <ArrowLeft size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}

// ─── Missing import fix ───────────────────────────────────────────────────────

function HeartHandshake({ size }: { size: number }) {
  return <HandHeart size={size} />;
}

// ─── Zakiy Featured Card ─────────────────────────────────────────────────────

export function SectionZakiyCard() {
  return (
    <Link
      href="/zakiy"
      className="block rounded-[24px] overflow-hidden active:scale-[0.97] transition-transform relative"
      style={{
        background:
          "linear-gradient(135deg, #0f0723 0%, #1e0d42 40%, #13204a 75%, #0c1a3d 100%)",
        border: "1px solid rgba(139,92,246,0.38)",
        boxShadow:
          "0 14px 45px rgba(88,28,200,0.28), 0 4px 14px rgba(0,0,0,0.45)",
      }}
    >
      {/* Glow orbs */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)",
          filter: "blur(22px)",
        }}
      />
      {/* Star particles */}
      {[
        [12, 18],
        [82, 12],
        [48, 7],
        [72, 32],
        [22, 38],
        [60, 22],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: i % 2 === 0 ? 2 : 1.5,
            height: i % 2 === 0 ? 2 : 1.5,
            background:
              i % 2 === 0
                ? "rgba(196,181,253,0.85)"
                : "rgba(147,197,253,0.65)",
          }}
        />
      ))}

      <div className="relative z-10 p-5">
        <div className="flex items-center gap-4">
          {/* Bot icon with glow ring */}
          <div className="relative shrink-0">
            <div
              className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.38) 0%, rgba(59,130,246,0.22) 100%)",
                border: "1px solid rgba(139,92,246,0.55)",
                boxShadow:
                  "0 0 28px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <Bot size={30} style={{ color: "#c4b5fd" }} />
            </div>
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-[2.5px]"
              style={{ background: "#34d399", borderColor: "#1e0d42" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase"
                style={{
                  background: "rgba(139,92,246,0.25)",
                  border: "1px solid rgba(139,92,246,0.42)",
                  color: "#c4b5fd",
                }}
              >
                GPT-4o
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                  background: "rgba(52,211,153,0.15)",
                  border: "1px solid rgba(52,211,153,0.32)",
                  color: "#6ee7b7",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: "#34d399" }}
                />
                متاح الآن
              </span>
            </div>
            <h3
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1.15,
                marginBottom: 4,
              }}
            >
              البوت الزكي
            </h3>
            <p
              style={{
                fontSize: 11.5,
                color: "rgba(196,181,253,0.65)",
                lineHeight: 1.5,
              }}
            >
              رفيقك الروحي الذكي — يسمعك ويرشدك
            </p>
          </div>

          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(139,92,246,0.2)",
              border: "1px solid rgba(139,92,246,0.38)",
            }}
          >
            <ArrowLeft size={17} style={{ color: "#a78bfa" }} />
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { icon: <BrainCircuit size={11} />, label: "يتذكر قصتك" },
            { icon: <Mic size={11} />, label: "صوت لصوت" },
            { icon: <Sparkles size={11} />, label: "إرشاد روحي" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ color: "rgba(196,181,253,0.75)" }}>{icon}</span>
              <span
                style={{
                  fontSize: 10.5,
                  color: "rgba(255,255,255,0.58)",
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── renderSection ────────────────────────────────────────────────────────────

export function renderSection(id: ListId): React.ReactNode {
  switch (id) {
    case "soul-meter":
      return <SectionSoulMeter />;
    case "journey-card":
      return <SectionJourneyCard />;
    case "journey30":
      return <SectionJourney30 />;
    case "invite":
      return <SectionInvite />;
    case "ameen":
      return <SectionAmeen />;
    case "tawbah-card":
      return <SectionTawbahCard />;
    case "signs":
      return <SectionSigns />;
    case "map":
      return <SectionMap />;
    case "live-stats":
      return <SectionLiveStats />;
    case "islamic-programs":
      return <SectionIslamicPrograms />;
    case "garden":
      return <SectionGarden />;
    case "munajat":
      return <SectionMunajat />;
    case "adhkar":
      return <SectionAdhkar />;
    case "quran-card":
      return <SectionQuranCard />;
    case "hadith-card":
      return <SectionHadithCard />;
    case "zakiy-card":
      return <SectionZakiyCard />;
  }
}
