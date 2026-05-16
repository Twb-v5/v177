import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  Brain, BookOpenText, Route, Tv, Sparkles,
  Clock, Repeat, Bell, Settings, ScrollText,
  BookOpen, NotebookPen, ListChecks, Plus, Minus,
} from "lucide-react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const GAP = 10;
const COL2 = (SW - PAD * 2 - GAP) / 2;
const FULL = SW - PAD * 2;

// ── Ward storage ──────────────────────────────────────────────────────────────
const todayKey = () => `quran_ward_${new Date().toISOString().slice(0, 10)}`;

function useWard() {
  const [pages, setPages] = useState(0);
  const TARGET = 5;

  useEffect(() => {
    AsyncStorage.getItem(todayKey())
      .then((v) => { if (v !== null) setPages(Number(v)); })
      .catch(() => {});
  }, []);

  const add = useCallback(() => {
    setPages((p) => {
      const n = p + 1;
      AsyncStorage.setItem(todayKey(), String(n)).catch(() => {});
      return n;
    });
  }, []);

  const sub = useCallback(() => {
    setPages((p) => {
      if (p <= 0) return 0;
      const n = p - 1;
      AsyncStorage.setItem(todayKey(), String(n)).catch(() => {});
      return n;
    });
  }, []);

  return { pages, target: TARGET, add, sub };
}

// ── Animated press wrapper ─────────────────────────────────────────────────────
function PressCard({
  onPress, children, style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 20, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 20, stiffness: 400 }); }}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 1. Zakiy Featured Card ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function ZakiyFeaturedCard({ isDark, isRTL }: { isDark: boolean; isRTL: boolean }) {
  const router = useRouter();
  const bg = isDark ? "#130B22" : "#F3EEFF";
  const border = isDark ? "rgba(167,139,250,0.22)" : "rgba(109,40,217,0.14)";
  const chipBg = isDark ? "rgba(167,139,250,0.12)" : "rgba(109,40,217,0.08)";
  const chipText = isDark ? "#C4B5FD" : "#6D28D9";
  const iconBg = isDark ? "rgba(167,139,250,0.15)" : "rgba(109,40,217,0.10)";
  const iconColor = isDark ? "#A78BFA" : "#7C3AED";
  const textPrimary = isDark ? "#EDE9FE" : "#3B0764";
  const textSub = isDark ? "rgba(237,233,254,0.55)" : "rgba(59,7,100,0.55)";
  const CHIPS = ["يتذكر قصتك", "صوت لصوت", "إرشاد روحي"];

  return (
    <PressCard onPress={() => router.push("/zakiy" as any)} style={{ width: FULL, marginBottom: GAP }}>
      <View style={{
        borderRadius: 24, borderWidth: 1, borderColor: border,
        backgroundColor: isDark ? "rgba(22,12,40,0.95)" : "rgba(255,255,255,0.96)",
        overflow: "hidden",
        shadowColor: isDark ? "#7C3AED" : "#7C3AED",
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.25 : 0.10, shadowRadius: 16,
        elevation: 6,
      }}>
        {/* bg tint */}
        <View style={{ position: "absolute", inset: 0, backgroundColor: bg, opacity: 0.6 }} />

        <View style={{ padding: 18 }}>
          {/* top row */}
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
                <Brain size={26} color={iconColor} />
              </View>
              <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: textPrimary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  البوت الزكي
                </Text>
                <Text style={{ fontSize: 11, color: textSub, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
                  رفيقك الروحي الذكي — يسمعك ويرشدك
                </Text>
              </View>
            </View>
            {/* badges */}
            <View style={{ alignItems: isRTL ? "flex-start" : "flex-end", gap: 5 }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: chipBg }}>
                <Text style={{ fontSize: 9, fontWeight: "800", color: iconColor, fontFamily: "IBMPlexSansArabic_700Bold", letterSpacing: 0.3 }}>
                  GPT-4o
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" }} />
                <Text style={{ fontSize: 9, color: "#10B981", fontFamily: "IBMPlexSansArabic_700Bold" }}>متاح الآن</Text>
              </View>
            </View>
          </View>

          {/* feature chips */}
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 7, flexWrap: "wrap" }}>
            {CHIPS.map((chip) => (
              <View key={chip} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: chipBg, borderWidth: 1, borderColor: border }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: chipText, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </PressCard>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 2. Quran Featured Card ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function QuranFeaturedCard({ isDark, isRTL }: { isDark: boolean; isRTL: boolean }) {
  const router = useRouter();
  const { pages, target, add, sub } = useWard();
  const bg = isDark ? "#1A1200" : "#FFFBEB";
  const border = isDark ? "rgba(245,158,11,0.22)" : "rgba(200,150,62,0.18)";
  const iconBg = isDark ? "rgba(245,158,11,0.14)" : "rgba(200,150,62,0.10)";
  const iconColor = isDark ? "#FCD34D" : "#C8963E";
  const textPrimary = isDark ? "#FDE68A" : "#7C5917";
  const textSub = isDark ? "rgba(253,230,138,0.55)" : "rgba(124,89,23,0.55)";
  const verseBg = isDark ? "rgba(245,158,11,0.07)" : "rgba(200,150,62,0.06)";
  const barFill = isDark ? "#F59E0B" : "#C8963E";
  const barBg = isDark ? "rgba(245,158,11,0.12)" : "rgba(200,150,62,0.10)";
  const wardPct = Math.min(1, pages / target);
  const done = pages >= target;

  return (
    <View style={{ width: FULL, marginBottom: GAP }}>
      <PressCard onPress={() => router.push("/quran" as any)}>
        <View style={{
          borderRadius: 24, borderWidth: 1, borderColor: border,
          backgroundColor: isDark ? "rgba(26,18,0,0.95)" : "rgba(255,255,255,0.96)",
          overflow: "hidden",
          shadowColor: isDark ? "#F59E0B" : "#C8963E",
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.18 : 0.08, shadowRadius: 14,
          elevation: 5,
        }}>
          <View style={{ position: "absolute", inset: 0, backgroundColor: bg, opacity: 0.6 }} />

          <View style={{ padding: 18 }}>
            {/* header row */}
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: iconBg, alignItems: "center", justifyContent: "center" }}>
                <BookOpenText size={26} color={iconColor} />
              </View>
              <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: textPrimary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  القرآن الكريم
                </Text>
                <Text style={{ fontSize: 11, color: textSub, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
                  مكتبة شاملة — تلاوة وتفسير وعلوم
                </Text>
              </View>
            </View>

            {/* stats row */}
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 14 }}>
              {[{ n: "١١٤", label: "سورة" }, { n: "٣٠", label: "جزءاً" }].map((s) => (
                <View key={s.label} style={{ flex: 1, backgroundColor: iconBg, borderRadius: 14, paddingVertical: 10, alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: iconColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>{s.n}</Text>
                  <Text style={{ fontSize: 10, color: textSub, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* verse */}
            <View style={{ backgroundColor: verseBg, borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <Text style={{ fontSize: 15, color: textPrimary, textAlign: "right", fontFamily: "Amiri_400Regular", lineHeight: 26 }}>
                ﴿كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ﴾
              </Text>
              <Text style={{ fontSize: 10, color: textSub, textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6 }}>
                — ص: ٢٩
              </Text>
            </View>
          </View>
        </View>
      </PressCard>

      {/* ward card — separate pressable */}
      <View style={{
        marginTop: 6, borderRadius: 18, borderWidth: 1, borderColor: border,
        backgroundColor: isDark ? "rgba(26,18,0,0.90)" : "rgba(255,251,235,0.98)",
        overflow: "hidden", padding: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
      }}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: bg, opacity: 0.5 }} />
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: textPrimary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
            ورد اليوم
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: done ? "#10B981" : iconColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>
            {pages}/{target} ص
          </Text>
        </View>

        {/* progress bar */}
        <View style={{ height: 6, backgroundColor: barBg, borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
          <View style={{ width: `${wardPct * 100}%`, height: "100%", backgroundColor: done ? "#10B981" : barFill, borderRadius: 99 }} />
        </View>

        {/* controls */}
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8 }}>
          <Pressable
            onPress={sub}
            style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: iconBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: border }}
          >
            <Minus size={14} color={iconColor} />
          </Pressable>
          <Pressable
            onPress={add}
            style={{ flex: 1, height: 34, borderRadius: 10, backgroundColor: done ? "rgba(16,185,129,0.12)" : iconBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: done ? "rgba(16,185,129,0.25)" : border, flexDirection: "row", gap: 6 }}
          >
            <Plus size={14} color={done ? "#10B981" : iconColor} />
            <Text style={{ fontSize: 12, fontWeight: "700", color: done ? "#10B981" : iconColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {done ? "أتممت وردك ✓" : "صفحة"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── 3. Simple full-width card ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
interface SimpleCard {
  id: string;
  labelAr: string;
  subtitle: string;
  Icon: any;
  href: string;
  variant: "purple" | "blue" | "emerald";
}

const VARIANT_FULL = {
  purple: {
    light: { bg: "#F5F0FF", border: "rgba(109,40,217,0.14)", icon: "#7C3AED", iconBg: "rgba(109,40,217,0.10)", text: "#5B21B6", sub: "rgba(91,33,182,0.55)" },
    dark:  { bg: "#120A1A", border: "rgba(167,139,250,0.22)", icon: "#A78BFA", iconBg: "rgba(167,139,250,0.14)", text: "#DDD6FE", sub: "rgba(221,214,254,0.50)" },
  },
  blue: {
    light: { bg: "#EFF6FF", border: "rgba(37,99,235,0.14)", icon: "#2563EB", iconBg: "rgba(37,99,235,0.10)", text: "#1E40AF", sub: "rgba(30,64,175,0.55)" },
    dark:  { bg: "#080F1A", border: "rgba(96,165,250,0.22)", icon: "#60A5FA", iconBg: "rgba(96,165,250,0.14)", text: "#BFDBFE", sub: "rgba(191,219,254,0.50)" },
  },
  emerald: {
    light: { bg: "#E8F8F2", border: "rgba(16,185,129,0.18)", icon: "#10B981", iconBg: "rgba(16,185,129,0.14)", text: "#065F46", sub: "rgba(6,95,70,0.55)" },
    dark:  { bg: "#0A1F18", border: "rgba(16,185,129,0.22)", icon: "#34D399", iconBg: "rgba(16,185,129,0.15)", text: "#A7F3D0", sub: "rgba(167,243,208,0.50)" },
  },
};

function SimpleFullCard({ card, isDark, isRTL }: { card: SimpleCard; isDark: boolean; isRTL: boolean }) {
  const router = useRouter();
  const vs = VARIANT_FULL[card.variant][isDark ? "dark" : "light"];
  const Icon = card.Icon;

  return (
    <PressCard onPress={() => router.push(card.href as any)} style={{ width: FULL, marginBottom: GAP }}>
      <View style={{
        borderRadius: 20, borderWidth: 1, borderColor: vs.border,
        backgroundColor: isDark ? "rgba(20,20,20,0.92)" : "rgba(255,255,255,0.95)",
        overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.25 : 0.06, shadowRadius: 10, elevation: 3,
      }}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: vs.bg, opacity: 0.5 }} />
        <View style={{ padding: 16, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: vs.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} color={vs.icon} />
          </View>
          <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: vs.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {card.labelAr}
            </Text>
            <Text style={{ fontSize: 11, color: vs.sub, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>
              {card.subtitle}
            </Text>
          </View>
          <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: vs.iconBg, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 13, color: vs.icon }}>›</Text>
          </View>
        </View>
      </View>
    </PressCard>
  );
}

const GROWTH_SIMPLE: SimpleCard[] = [
  { id: "journey30", labelAr: "رحلة ٣٠ يوماً",    subtitle: "برنامج تدريجي يومي للتوبة والاستقامة", Icon: Route,      href: "/journey",  variant: "purple" },
  { id: "programs",  labelAr: "برامج إسلامية",     subtitle: "٥٠ برنامج — تفسير وفتاوى وسيرة نبوية", Icon: Tv,          href: "/programs", variant: "blue"   },
  { id: "adhkar",    labelAr: "الأذكار والأدعية",  subtitle: "٢٨ قسماً — صباح ومساء وصلاة وحياة",    Icon: Sparkles,    href: "/adhkar",   variant: "emerald"},
];

// ══════════════════════════════════════════════════════════════════════════════
// ── 4. Half-width daily tool card ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
interface DailyCard {
  id: string;
  labelAr: string;
  subtitle: string;
  Icon: any;
  href: string;
  variant: "amber" | "blue" | "gold" | "neutral" | "danger" | "emerald" | "purple" | "cyan";
}

const VARIANT_HALF = {
  amber:   { light: { bg: "#FFFBEB", border: "rgba(217,119,6,0.18)",   icon: "#D97706", iconBg: "rgba(217,119,6,0.12)",   text: "#92400E" }, dark: { bg: "#1A1200", border: "rgba(251,191,36,0.22)", icon: "#FCD34D", iconBg: "rgba(251,191,36,0.14)", text: "#FDE68A" } },
  blue:    { light: { bg: "#EFF6FF", border: "rgba(37,99,235,0.14)",   icon: "#2563EB", iconBg: "rgba(37,99,235,0.10)",   text: "#1E40AF" }, dark: { bg: "#080F1A", border: "rgba(96,165,250,0.22)", icon: "#60A5FA", iconBg: "rgba(96,165,250,0.14)", text: "#BFDBFE" } },
  gold:    { light: { bg: "#FDF6E8", border: "rgba(200,150,62,0.18)",  icon: "#C8963E", iconBg: "rgba(200,150,62,0.12)",  text: "#7C5917" }, dark: { bg: "#1A1206", border: "rgba(245,158,11,0.22)", icon: "#F59E0B", iconBg: "rgba(245,158,11,0.14)", text: "#FCD34D" } },
  neutral: { light: { bg: "#FAFAF8", border: "rgba(0,0,0,0.07)",       icon: "#2D6A4F", iconBg: "rgba(45,106,79,0.08)",   text: "#374151" }, dark: { bg: "#141414", border: "rgba(255,255,255,0.08)", icon: "#10B981", iconBg: "rgba(16,185,129,0.10)", text: "#D1D5DB" } },
  danger:  { light: { bg: "#FFF1F0", border: "rgba(220,38,38,0.16)",   icon: "#DC2626", iconBg: "rgba(220,38,38,0.10)",   text: "#991B1B" }, dark: { bg: "#1A0A0A", border: "rgba(239,68,68,0.22)",  icon: "#EF4444", iconBg: "rgba(239,68,68,0.14)",  text: "#FCA5A5" } },
  emerald: { light: { bg: "#E8F8F2", border: "rgba(16,185,129,0.18)",  icon: "#10B981", iconBg: "rgba(16,185,129,0.14)",  text: "#065F46" }, dark: { bg: "#0A1F18", border: "rgba(16,185,129,0.22)", icon: "#34D399", iconBg: "rgba(16,185,129,0.15)", text: "#A7F3D0" } },
  purple:  { light: { bg: "#F5F0FF", border: "rgba(109,40,217,0.14)",  icon: "#7C3AED", iconBg: "rgba(109,40,217,0.10)",  text: "#5B21B6" }, dark: { bg: "#120A1A", border: "rgba(167,139,250,0.22)", icon: "#A78BFA", iconBg: "rgba(167,139,250,0.14)", text: "#DDD6FE" } },
  cyan:    { light: { bg: "#ECFEFF", border: "rgba(6,182,212,0.16)",   icon: "#0891B2", iconBg: "rgba(6,182,212,0.10)",   text: "#155E75" }, dark: { bg: "#030F14", border: "rgba(34,211,238,0.20)", icon: "#22D3EE", iconBg: "rgba(34,211,238,0.12)", text: "#A5F3FC" } },
};

const DAILY_CARDS: DailyCard[] = [
  { id: "dhikr",        labelAr: "مسبحة الذكر",   subtitle: "استغفار وتسبيح",     Icon: Repeat,      href: "/dhikr",         variant: "amber"   },
  { id: "prayer",       labelAr: "مواقيت الصلاة", subtitle: "تذكيرات ذكية",       Icon: Clock,       href: "/prayer-times",  variant: "blue"    },
  { id: "notifications",labelAr: "الإشعارات",     subtitle: "تنبيهات الصلاة",     Icon: Bell,        href: "/notifications", variant: "gold"    },
  { id: "settings",     labelAr: "الإعدادات",     subtitle: "حساب وسمات",         Icon: Settings,    href: "/account",       variant: "neutral" },
  { id: "kaffarah",     labelAr: "الكفارات",      subtitle: "خطوات مفصّلة",       Icon: ScrollText,  href: "/kaffarah",      variant: "danger"  },
  { id: "rajaa",        labelAr: "مكتبة الرجاء",  subtitle: "آيات وأحاديث",       Icon: BookOpen,    href: "/rajaa",         variant: "emerald" },
  { id: "journal",      labelAr: "يومياتي",       subtitle: "مساحة سرية",         Icon: NotebookPen, href: "/journal",       variant: "purple"  },
  { id: "hadi-tasks",   labelAr: "دليل الذنوب",   subtitle: "توبة خطوة بخطوة",    Icon: ListChecks,  href: "/hadi-tasks",    variant: "cyan"    },
];

function HalfCard({ card, isDark, isRTL }: { card: DailyCard; isDark: boolean; isRTL: boolean }) {
  const router = useRouter();
  const vs = VARIANT_HALF[card.variant][isDark ? "dark" : "light"];
  const Icon = card.Icon;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animStyle, { width: COL2 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 20, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 20, stiffness: 400 }); }}
        onPress={() => router.push(card.href as any)}
        style={{
          borderRadius: 20, borderWidth: 1, borderColor: vs.border,
          backgroundColor: isDark ? "rgba(20,20,20,0.92)" : "rgba(255,255,255,0.94)",
          minHeight: 110, padding: 14, overflow: "hidden",
          shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.28 : 0.07, shadowRadius: 10, elevation: 3,
        }}
      >
        <View style={{ position: "absolute", inset: 0, backgroundColor: vs.bg, borderRadius: 20, opacity: 0.55 }} />
        <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: vs.iconBg, alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} color={vs.icon} />
        </View>
        <View style={{ marginTop: "auto", paddingTop: 10, alignItems: isRTL ? "flex-end" : "flex-start" }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: vs.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>
            {card.labelAr}
          </Text>
          <Text style={{ fontSize: 10, color: vs.text, opacity: 0.58, marginTop: 2, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left" }}>
            {card.subtitle}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, isDark, isRTL, c }: { title: string; subtitle: string; isDark: boolean; isRTL: boolean; c: any }) {
  return (
    <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
      <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: c.primary }} />
      <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
        <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.40)" : "rgba(0,0,0,0.42)", marginTop: 1, fontFamily: "IBMPlexSansArabic_400Regular" }}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Main BentoGrid ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export function BentoGrid() {
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const dailyPairs: [DailyCard, DailyCard][] = [
    [DAILY_CARDS[0]!, DAILY_CARDS[1]!],
    [DAILY_CARDS[2]!, DAILY_CARDS[3]!],
    [DAILY_CARDS[4]!, DAILY_CARDS[5]!],
    [DAILY_CARDS[6]!, DAILY_CARDS[7]!],
  ];

  return (
    <View style={{ paddingHorizontal: PAD }}>

      {/* ══ رحلتك الروحية ══ */}
      <SectionHeader
        title="رحلتك الروحية"
        subtitle="الزكي • القرآن • التوبة • البرامج"
        isDark={isDark} isRTL={isRTL} c={c}
      />

      <ZakiyFeaturedCard isDark={isDark} isRTL={isRTL} />
      <QuranFeaturedCard isDark={isDark} isRTL={isRTL} />

      {GROWTH_SIMPLE.map((card) => (
        <SimpleFullCard key={card.id} card={card} isDark={isDark} isRTL={isRTL} />
      ))}

      <View style={{ height: 8 }} />

      {/* ══ أدواتك اليومية ══ */}
      <SectionHeader
        title="أدواتك اليومية"
        subtitle="ذكر • صلاة • إشعارات • كفارات"
        isDark={isDark} isRTL={isRTL} c={c}
      />

      {dailyPairs.map(([a, b], i) => (
        <View
          key={i}
          style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: GAP, marginBottom: GAP }}
        >
          <HalfCard card={a} isDark={isDark} isRTL={isRTL} />
          <HalfCard card={b} isDark={isDark} isRTL={isRTL} />
        </View>
      ))}

    </View>
  );
}
