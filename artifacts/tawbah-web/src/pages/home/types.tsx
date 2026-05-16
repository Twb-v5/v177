import {
  BookOpen,
  CircleDot,
  PenLine,
  ListChecks,
  Users,
  Swords,
  ScrollText,
  Clock,
  Heart,
  BarChart2,
  Bell,
  ShieldAlert,
  HeartHandshake,
  Zap,
  Settings,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type BannerType = "season" | "nafl" | "ayah" | "hadith" | "dua" | "wisdom";
export type AyahRef = { surah: number; ayah: number };
export type BannerItem = {
  type: BannerType;
  label: string;
  content: string;
  icon: "sparkles" | "moon" | "sun" | "star" | "book" | "chat";
  seasonColor?: string;
  ayahRef?: AyahRef;
  tafsir?: string;
};

export type GridId =
  | "rajaa"
  | "dhikr"
  | "journal"
  | "hadi-tasks"
  | "dhikr-rooms"
  | "challenge"
  | "kaffarah"
  | "prayer-times"
  | "relapse"
  | "progress-map"
  | "notifications"
  | "danger-times"
  | "secret-dua"
  | "dua-timing"
  | "settings";

export type ListId =
  | "quran-card"
  | "soul-meter"
  | "hadith-card"
  | "journey-card"
  | "journey30"
  | "invite"
  | "ameen"
  | "tawbah-card"
  | "signs"
  | "map"
  | "live-stats"
  | "islamic-programs"
  | "garden"
  | "munajat"
  | "adhkar"
  | "zakiy-card";

export type SectionId = GridId | ListId;

export type GridCardMeta = {
  href: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconBg: string;
};

export interface BannerSlide {
  label: string;
  icon: "sparkles" | "moon" | "sun" | "star" | "book" | "chat";
  text: string;
  bg: string;
  borderColor: string;
  accent: string;
  labelColor: string;
}

// ─── Section ID sets ──────────────────────────────────────────────────────────

export const GRID_IDS = new Set<SectionId>([
  "rajaa",
  "dhikr",
  "journal",
  "hadi-tasks",
  "dhikr-rooms",
  "challenge",
  "kaffarah",
  "prayer-times",
  "relapse",
  "progress-map",
  "notifications",
  "danger-times",
  "secret-dua",
  "dua-timing",
  "settings",
]);

export const GRID_DEFAULT: GridId[] = [
  "rajaa",
  "dhikr",
  "prayer-times",
  "dhikr-rooms",
  "secret-dua",
  "hadi-tasks",
  "dua-timing",
  "notifications",
  "journal",
  "progress-map",
  "kaffarah",
  "challenge",
  "danger-times",
  "relapse",
];

export const LIST_DEFAULT: ListId[] = [
  "quran-card",
  "adhkar",
  "hadith-card",
  "journey30",
  "journey-card",
  "garden",
  "soul-meter",
  "ameen",
  "invite",
  "munajat",
  "islamic-programs",
  "tawbah-card",
  "signs",
  "map",
  "live-stats",
];

export const ALL_SECTIONS: SectionId[] = [
  // ── Growth (full-width featured items) ──
  "zakiy-card",
  "quran-card",
  "journey30",
  "islamic-programs",
  "adhkar",
  "invite",
  // ── Daily grid ──
  "dhikr",
  "prayer-times",
  "notifications",
  "settings",
  "kaffarah",
  "rajaa",
  "journal",
  "hadi-tasks",
  // ── Extra (accessible via edit mode) ──
  "journey-card",
  "hadith-card",
  "garden",
  "soul-meter",
  "progress-map",
  "ameen",
  "dhikr-rooms",
  "secret-dua",
  "dua-timing",
  "challenge",
  "danger-times",
  "relapse",
  "munajat",
  "tawbah-card",
  "signs",
  "map",
  "live-stats",
];

export const COMBINED_STORAGE_KEY = "home_combined_order_v14";

// ─── Order persistence ────────────────────────────────────────────────────────

export function loadCombinedOrder(): SectionId[] {
  try {
    const saved = localStorage.getItem(COMBINED_STORAGE_KEY);
    if (saved) {
      const parsed: SectionId[] = JSON.parse(saved);
      const valid = parsed.filter((id) => ALL_SECTIONS.includes(id));
      const missing = ALL_SECTIONS.filter((id) => !valid.includes(id));
      return [...valid, ...missing];
    }
  } catch {}
  return ALL_SECTIONS;
}

export function saveCombinedOrder(order: SectionId[]) {
  try {
    localStorage.setItem(COMBINED_STORAGE_KEY, JSON.stringify(order));
  } catch {}
}

export function isGridItem(id: SectionId): id is GridId {
  return GRID_IDS.has(id);
}

// ─── Grid card metadata ───────────────────────────────────────────────────────

export const GRID_META: Record<GridId, GridCardMeta> = {
  rajaa: {
    href: "/rajaa",
    label: "مكتبة الرجاء",
    sub: "آيات وأحاديث",
    icon: <BookOpen size={22} />,
    bg: "from-emerald-600/20 to-teal-500/8",
    border: "border-emerald-500/35",
    iconBg: "bg-emerald-500/20 text-emerald-400",
  },
  dhikr: {
    href: "/dhikr",
    label: "مسبحة الذكر",
    sub: "استغفار وتسبيح",
    icon: <CircleDot size={22} />,
    bg: "from-amber-500/20 to-yellow-400/8",
    border: "border-amber-400/35",
    iconBg: "bg-amber-500/20 text-amber-500",
  },
  journal: {
    href: "/journal",
    label: "يومياتي",
    sub: "مساحة سرية",
    icon: <PenLine size={22} />,
    bg: "from-violet-600/20 to-purple-500/8",
    border: "border-violet-500/35",
    iconBg: "bg-violet-600/20 text-violet-400",
  },
  "hadi-tasks": {
    href: "/hadi-tasks",
    label: "دليل الذنوب",
    sub: "توبة خطوة بخطوة",
    icon: <ListChecks size={22} />,
    bg: "from-cyan-600/20 to-sky-500/8",
    border: "border-cyan-500/35",
    iconBg: "bg-cyan-600/20 text-cyan-400",
  },
  "dhikr-rooms": {
    href: "/dhikr-rooms",
    label: "غرف الذكر",
    sub: "مع آلاف المسلمين",
    icon: <Users size={22} />,
    bg: "from-teal-600/20 to-emerald-500/8",
    border: "border-teal-500/35",
    iconBg: "bg-teal-600/20 text-teal-400",
  },
  challenge: {
    href: "/challenge/create",
    label: "تحدي التوبة",
    sub: "شارك رابطه",
    icon: <Swords size={22} />,
    bg: "from-orange-500/20 to-red-400/8",
    border: "border-orange-400/35",
    iconBg: "bg-orange-500/20 text-orange-400",
  },
  kaffarah: {
    href: "/kaffarah",
    label: "الكفارات",
    sub: "خطوات مفصّلة",
    icon: <ScrollText size={22} />,
    bg: "from-red-600/20 to-rose-500/8",
    border: "border-red-500/35",
    iconBg: "bg-red-600/20 text-red-400",
  },
  "prayer-times": {
    href: "/prayer-times",
    label: "مواقيت الصلاة",
    sub: "تذكيرات ذكية",
    icon: <Clock size={22} />,
    bg: "from-indigo-600/20 to-blue-500/8",
    border: "border-indigo-500/35",
    iconBg: "bg-indigo-600/20 text-indigo-400",
  },
  relapse: {
    href: "/relapse",
    label: "ضعفت وعدت؟",
    sub: "لا تيأس",
    icon: <Heart size={22} />,
    bg: "from-pink-500/20 to-rose-400/8",
    border: "border-pink-400/35",
    iconBg: "bg-pink-500/20 text-pink-400",
  },
  "progress-map": {
    href: "/progress",
    label: "خريطة التقدم",
    sub: "إحصاءاتك",
    icon: <BarChart2 size={22} />,
    bg: "from-blue-600/20 to-sky-500/8",
    border: "border-blue-500/35",
    iconBg: "bg-blue-600/20 text-blue-400",
  },
  notifications: {
    href: "/notifications",
    label: "الإشعارات",
    sub: "تنبيهات الصلاة",
    icon: <Bell size={22} />,
    bg: "from-amber-600/20 to-orange-500/8",
    border: "border-amber-500/35",
    iconBg: "bg-amber-600/20 text-amber-400",
  },
  "danger-times": {
    href: "/danger-times",
    label: "أوقات الخطر",
    sub: "تذكيرات وقائية",
    icon: <ShieldAlert size={22} />,
    bg: "from-red-700/20 to-orange-600/8",
    border: "border-red-600/35",
    iconBg: "bg-red-700/20 text-red-400",
  },
  "secret-dua": {
    href: "/secret-dua",
    label: "الصديق السري",
    sub: "ادعُ لأخٍ مجهول",
    icon: <HeartHandshake size={22} />,
    bg: "from-rose-600/20 to-pink-500/8",
    border: "border-rose-500/35",
    iconBg: "bg-rose-600/20 text-rose-400",
  },
  "dua-timing": {
    href: "/dua-timing",
    label: "لحظة الإجابة",
    sub: "أقوى أوقات الدعاء",
    icon: <Zap size={22} />,
    bg: "from-yellow-500/20 to-amber-400/8",
    border: "border-yellow-400/35",
    iconBg: "bg-yellow-500/20 text-yellow-400",
  },
  settings: {
    href: "/account",
    label: "الإعدادات",
    sub: "حساب وسمات",
    icon: <Settings size={22} />,
    bg: "from-slate-600/20 to-gray-500/8",
    border: "border-slate-500/35",
    iconBg: "bg-slate-600/20 text-slate-300",
  },
};
