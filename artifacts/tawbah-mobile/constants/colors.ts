const colors = {
  light: {
    background: "#F5F3EE",
    backgroundDeep: "#EDE9E0",
    surface: "#FFFFFF",
    surfaceElevated: "#FAFAF8",
    surfaceGlass: "rgba(255,255,255,0.80)",
    surfaceGlassBorder: "rgba(255,255,255,0.60)",

    primary: "#2D6A4F",
    primaryLight: "#52B788",
    primaryGlow: "rgba(45,106,79,0.15)",

    accent: "#C8963E",
    accentLight: "#E8B86D",
    accentGlow: "rgba(200,150,62,0.18)",

    emerald: "#10B981",
    emeraldGlow: "rgba(16,185,129,0.15)",

    text: "#1C1917",
    textSecondary: "#57534E",
    textMuted: "#A8A29E",
    textInverse: "#FFFFFF",

    border: "rgba(45,106,79,0.12)",
    borderStrong: "rgba(45,106,79,0.25)",
    divider: "rgba(0,0,0,0.06)",

    card: "#FFFFFF",
    cardAlt: "#F7F5F0",
    cardBento1: "#E8F5EE",
    cardBento2: "#FDF6E8",
    cardBento3: "#EEF0F8",
    cardBento4: "#F5EEF8",

    danger: "#DC2626",
    dangerLight: "#FEF2F2",

    shadow: "rgba(0,0,0,0.08)",
    shadowStrong: "rgba(0,0,0,0.15)",

    tint: "#2D6A4F",
    text: "#1C1917",
  },

  dark: {
    background: "#070707",
    backgroundDeep: "#000000",
    surface: "#111111",
    surfaceElevated: "#1A1A1A",
    surfaceGlass: "rgba(16,16,16,0.85)",
    surfaceGlassBorder: "rgba(255,255,255,0.08)",

    primary: "#10B981",
    primaryLight: "#34D399",
    primaryGlow: "rgba(16,185,129,0.20)",

    accent: "#F59E0B",
    accentLight: "#FCD34D",
    accentGlow: "rgba(245,158,11,0.20)",

    emerald: "#10B981",
    emeraldGlow: "rgba(16,185,129,0.25)",

    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    textInverse: "#000000",

    border: "rgba(16,185,129,0.12)",
    borderStrong: "rgba(16,185,129,0.25)",
    divider: "rgba(255,255,255,0.06)",

    card: "#141414",
    cardAlt: "#1C1C1C",
    cardBento1: "#0D1F18",
    cardBento2: "#1C1608",
    cardBento3: "#0E1020",
    cardBento4: "#180D20",

    danger: "#EF4444",
    dangerLight: "#1F0808",

    shadow: "rgba(0,0,0,0.40)",
    shadowStrong: "rgba(0,0,0,0.65)",

    tint: "#10B981",
    text: "#F1F5F9",
  },

  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 30,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

export default colors;
export type ColorScheme = typeof colors.light;
