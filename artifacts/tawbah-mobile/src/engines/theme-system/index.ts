// ─── Theme System — 8+ Islamic Themes ─────────────────────────────────────────

export interface AppTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  description: string;
  mode: "light" | "dark";
  colors: ThemeColors;
}

export interface ThemeColors {
  background: string;
  backgroundDeep: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;

  primary: string;
  primaryLight: string;
  primaryGlow: string;

  accent: string;
  accentLight: string;
  accentGlow: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  border: string;
  divider: string;
  card: string;
  cardAlt: string;

  danger: string;
  shadow: string;
}

// ─── 10 Themes ────────────────────────────────────────────────────────────────

export const THEMES: AppTheme[] = [
  {
    id: "deep-night",
    nameAr: "الليل العميق",
    nameEn: "Deep Night",
    emoji: "🌑",
    description: "OLED أسود خالص — للتأمل والعبادة الليلية",
    mode: "dark",
    colors: {
      background: "#070707",
      backgroundDeep: "#000000",
      surface: "#111111",
      surfaceElevated: "#1A1A1A",
      surfaceGlass: "rgba(16,16,16,0.90)",
      primary: "#10B981",
      primaryLight: "#34D399",
      primaryGlow: "rgba(16,185,129,0.22)",
      accent: "#F59E0B",
      accentLight: "#FCD34D",
      accentGlow: "rgba(245,158,11,0.20)",
      text: "#F1F5F9",
      textSecondary: "#94A3B8",
      textMuted: "#64748B",
      border: "rgba(16,185,129,0.12)",
      divider: "rgba(255,255,255,0.06)",
      card: "#141414",
      cardAlt: "#1C1C1C",
      danger: "#EF4444",
      shadow: "rgba(0,0,0,0.5)",
    },
  },
  {
    id: "morning-peace",
    nameAr: "سكينة الصباح",
    nameEn: "Morning Peace",
    emoji: "🌸",
    description: "أبيض لؤلؤي وأخضر الغابة — لأذكار الصباح",
    mode: "light",
    colors: {
      background: "#F5F3EE",
      backgroundDeep: "#EDE9E0",
      surface: "#FFFFFF",
      surfaceElevated: "#FAFAF8",
      surfaceGlass: "rgba(255,255,255,0.85)",
      primary: "#2D6A4F",
      primaryLight: "#52B788",
      primaryGlow: "rgba(45,106,79,0.16)",
      accent: "#C8963E",
      accentLight: "#E8B86D",
      accentGlow: "rgba(200,150,62,0.18)",
      text: "#1C1917",
      textSecondary: "#57534E",
      textMuted: "#A8A29E",
      border: "rgba(45,106,79,0.12)",
      divider: "rgba(0,0,0,0.06)",
      card: "#FFFFFF",
      cardAlt: "#F7F5F0",
      danger: "#DC2626",
      shadow: "rgba(0,0,0,0.08)",
    },
  },
  {
    id: "ramadan-night",
    nameAr: "ليالي رمضان",
    nameEn: "Ramadan Night",
    emoji: "🌙",
    description: "بنفسجي ذهبي — رهبة الليالي المباركة",
    mode: "dark",
    colors: {
      background: "#0D0A1A",
      backgroundDeep: "#060411",
      surface: "#130F22",
      surfaceElevated: "#1C1730",
      surfaceGlass: "rgba(19,15,34,0.92)",
      primary: "#A78BFA",
      primaryLight: "#C4B5FD",
      primaryGlow: "rgba(167,139,250,0.22)",
      accent: "#FCD34D",
      accentLight: "#FEF08A",
      accentGlow: "rgba(252,211,77,0.20)",
      text: "#F5F3FF",
      textSecondary: "#C4B5FD",
      textMuted: "#7C6FAD",
      border: "rgba(167,139,250,0.14)",
      divider: "rgba(255,255,255,0.06)",
      card: "#181228",
      cardAlt: "#201A35",
      danger: "#F87171",
      shadow: "rgba(0,0,0,0.6)",
    },
  },
  {
    id: "desert-gold",
    nameAr: "ذهب الصحراء",
    nameEn: "Desert Gold",
    emoji: "🏜️",
    description: "ذهبي رملي دافئ — إلهام صحراء الجزيرة العربية",
    mode: "light",
    colors: {
      background: "#FDF8EF",
      backgroundDeep: "#F5EDDA",
      surface: "#FFFCF5",
      surfaceElevated: "#FFFFF8",
      surfaceGlass: "rgba(255,252,245,0.88)",
      primary: "#B45309",
      primaryLight: "#D97706",
      primaryGlow: "rgba(180,83,9,0.15)",
      accent: "#065F46",
      accentLight: "#059669",
      accentGlow: "rgba(6,95,70,0.15)",
      text: "#1C1208",
      textSecondary: "#6B4F28",
      textMuted: "#9D7E52",
      border: "rgba(180,83,9,0.14)",
      divider: "rgba(0,0,0,0.06)",
      card: "#FFFCF5",
      cardAlt: "#F9F3E6",
      danger: "#DC2626",
      shadow: "rgba(100,60,0,0.10)",
    },
  },
  {
    id: "ocean-calm",
    nameAr: "هدوء المحيط",
    nameEn: "Ocean Calm",
    emoji: "🌊",
    description: "أزرق خليج هادئ — للتفكر والتدبر",
    mode: "dark",
    colors: {
      background: "#080F1A",
      backgroundDeep: "#040A12",
      surface: "#0C1728",
      surfaceElevated: "#132035",
      surfaceGlass: "rgba(12,23,40,0.92)",
      primary: "#38BDF8",
      primaryLight: "#7DD3FC",
      primaryGlow: "rgba(56,189,248,0.22)",
      accent: "#FCD34D",
      accentLight: "#FEF08A",
      accentGlow: "rgba(252,211,77,0.18)",
      text: "#E0F2FE",
      textSecondary: "#7DD3FC",
      textMuted: "#4A7FA0",
      border: "rgba(56,189,248,0.14)",
      divider: "rgba(255,255,255,0.06)",
      card: "#0F1E34",
      cardAlt: "#162540",
      danger: "#F87171",
      shadow: "rgba(0,0,0,0.55)",
    },
  },
  {
    id: "rose-dawn",
    nameAr: "فجر الورد",
    nameEn: "Rose Dawn",
    emoji: "🌹",
    description: "وردي فجري رقيق — لمناجاة الروح",
    mode: "light",
    colors: {
      background: "#FFF5F7",
      backgroundDeep: "#FFE4E9",
      surface: "#FFFFFF",
      surfaceElevated: "#FFFAFB",
      surfaceGlass: "rgba(255,255,255,0.88)",
      primary: "#BE185D",
      primaryLight: "#EC4899",
      primaryGlow: "rgba(190,24,93,0.14)",
      accent: "#6D28D9",
      accentLight: "#8B5CF6",
      accentGlow: "rgba(109,40,217,0.14)",
      text: "#1C0E14",
      textSecondary: "#6B3A52",
      textMuted: "#A87090",
      border: "rgba(190,24,93,0.12)",
      divider: "rgba(0,0,0,0.05)",
      card: "#FFFFFF",
      cardAlt: "#FFF0F5",
      danger: "#DC2626",
      shadow: "rgba(180,0,80,0.08)",
    },
  },
  {
    id: "forest-night",
    nameAr: "غابة الليل",
    nameEn: "Forest Night",
    emoji: "🌿",
    description: "أخضر عميق داكن — لقراءة القرآن الليلية",
    mode: "dark",
    colors: {
      background: "#040D07",
      backgroundDeep: "#020803",
      surface: "#071410",
      surfaceElevated: "#0D1F18",
      surfaceGlass: "rgba(7,20,16,0.92)",
      primary: "#34D399",
      primaryLight: "#6EE7B7",
      primaryGlow: "rgba(52,211,153,0.22)",
      accent: "#FCD34D",
      accentLight: "#FEF08A",
      accentGlow: "rgba(252,211,77,0.18)",
      text: "#ECFDF5",
      textSecondary: "#6EE7B7",
      textMuted: "#34786B",
      border: "rgba(52,211,153,0.14)",
      divider: "rgba(255,255,255,0.05)",
      card: "#0B1E17",
      cardAlt: "#102820",
      danger: "#F87171",
      shadow: "rgba(0,0,0,0.6)",
    },
  },
  {
    id: "slate-minimal",
    nameAr: "رمادي نظيف",
    nameEn: "Slate Minimal",
    emoji: "🩶",
    description: "رمادي محايد أنيق — تركيز بلا تشتت",
    mode: "dark",
    colors: {
      background: "#0F172A",
      backgroundDeep: "#0A0F1E",
      surface: "#1E293B",
      surfaceElevated: "#293548",
      surfaceGlass: "rgba(30,41,59,0.92)",
      primary: "#94A3B8",
      primaryLight: "#CBD5E1",
      primaryGlow: "rgba(148,163,184,0.20)",
      accent: "#38BDF8",
      accentLight: "#7DD3FC",
      accentGlow: "rgba(56,189,248,0.18)",
      text: "#F1F5F9",
      textSecondary: "#94A3B8",
      textMuted: "#64748B",
      border: "rgba(148,163,184,0.12)",
      divider: "rgba(255,255,255,0.06)",
      card: "#1E293B",
      cardAlt: "#253042",
      danger: "#F87171",
      shadow: "rgba(0,0,0,0.45)",
    },
  },
  {
    id: "mecca-dawn",
    nameAr: "فجر مكة المكرمة",
    nameEn: "Mecca Dawn",
    emoji: "🕋",
    description: "ذهبي فجري — بهاء الأماكن المقدسة",
    mode: "dark",
    colors: {
      background: "#0F0A00",
      backgroundDeep: "#080600",
      surface: "#1A1200",
      surfaceElevated: "#251C00",
      surfaceGlass: "rgba(26,18,0,0.92)",
      primary: "#F59E0B",
      primaryLight: "#FCD34D",
      primaryGlow: "rgba(245,158,11,0.25)",
      accent: "#10B981",
      accentLight: "#34D399",
      accentGlow: "rgba(16,185,129,0.20)",
      text: "#FFFBEB",
      textSecondary: "#FCD34D",
      textMuted: "#92743A",
      border: "rgba(245,158,11,0.16)",
      divider: "rgba(255,255,255,0.06)",
      card: "#1E1600",
      cardAlt: "#261E00",
      danger: "#F87171",
      shadow: "rgba(0,0,0,0.6)",
    },
  },
  {
    id: "spring-garden",
    nameAr: "حديقة الربيع",
    nameEn: "Spring Garden",
    emoji: "🌺",
    description: "أبيض وأخضر زمردي — نقاء وانطلاق جديد",
    mode: "light",
    colors: {
      background: "#F0FDF4",
      backgroundDeep: "#DCFCE7",
      surface: "#FFFFFF",
      surfaceElevated: "#F7FFF9",
      surfaceGlass: "rgba(255,255,255,0.88)",
      primary: "#16A34A",
      primaryLight: "#22C55E",
      primaryGlow: "rgba(22,163,74,0.16)",
      accent: "#D97706",
      accentLight: "#F59E0B",
      accentGlow: "rgba(217,119,6,0.16)",
      text: "#052E16",
      textSecondary: "#166534",
      textMuted: "#4ADE80",
      border: "rgba(22,163,74,0.14)",
      divider: "rgba(0,0,0,0.05)",
      card: "#FFFFFF",
      cardAlt: "#F0FDF4",
      danger: "#DC2626",
      shadow: "rgba(0,100,0,0.08)",
    },
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map(t => [t.id, t]));

export function getTheme(id: string): AppTheme {
  return THEME_MAP[id] || THEMES[0];
}

export function getThemesByMode(mode: "light" | "dark"): AppTheme[] {
  return THEMES.filter(t => t.mode === mode);
}
