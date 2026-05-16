import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  BookOpenText,
  Clock,
  Repeat,
  Sparkles,
  Brain,
  Route,
  NotebookPen,
  AlertTriangle,
  Bell,
  Settings,
  ScrollText,
  BookOpen,
  ListChecks,
  Tv,
} from "lucide-react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const GAP = 10;
const COL2 = (SW - PAD * 2 - GAP) / 2;

interface BentoCard {
  id: string;
  labelAr: string;
  Icon: any;
  href: string;
  size: "half" | "full";
  variant: "emerald" | "gold" | "danger" | "purple" | "blue" | "neutral" | "amber" | "cyan";
  badge?: string;
  subtitle?: string;
}

// ── Daily Grid Cards (2-column) ───────────────────────────────────────────────
const DAILY_CARDS: BentoCard[] = [
  {
    id: "dhikr",
    labelAr: "مسبحة الذكر",
    Icon: Repeat,
    href: "/dhikr",
    size: "half",
    variant: "amber",
    subtitle: "استغفار وتسبيح",
  },
  {
    id: "prayer",
    labelAr: "مواقيت الصلاة",
    Icon: Clock,
    href: "/prayer-times",
    size: "half",
    variant: "blue",
    subtitle: "تذكيرات ذكية",
  },
  {
    id: "notifications",
    labelAr: "الإشعارات",
    Icon: Bell,
    href: "/notifications",
    size: "half",
    variant: "gold",
    subtitle: "إعداد التنبيهات",
  },
  {
    id: "settings",
    labelAr: "الإعدادات",
    Icon: Settings,
    href: "/account",
    size: "half",
    variant: "neutral",
    subtitle: "حساب وسمات",
  },
  {
    id: "kaffarah",
    labelAr: "الكفارات",
    Icon: ScrollText,
    href: "/kaffarah",
    size: "half",
    variant: "danger",
    subtitle: "خطوات مفصّلة",
  },
  {
    id: "rajaa",
    labelAr: "مكتبة الرجاء",
    Icon: BookOpen,
    href: "/rajaa",
    size: "half",
    variant: "emerald",
    subtitle: "آيات وأحاديث",
  },
  {
    id: "journal",
    labelAr: "يومياتي",
    Icon: NotebookPen,
    href: "/journal",
    size: "half",
    variant: "purple",
    subtitle: "مساحة سرية",
  },
  {
    id: "hadi-tasks",
    labelAr: "دليل الذنوب",
    Icon: ListChecks,
    href: "/hadi-tasks",
    size: "half",
    variant: "cyan",
    subtitle: "توبة خطوة بخطوة",
  },
];

// ── Growth Full-Width Cards ───────────────────────────────────────────────────
const GROWTH_CARDS: BentoCard[] = [
  {
    id: "zakiy",
    labelAr: "البوت الزكي",
    Icon: Brain,
    href: "/zakiy",
    size: "full",
    variant: "purple",
    badge: "GPT-4o",
    subtitle: "رفيقك الروحي الذكي — يسمعك ويرشدك",
  },
  {
    id: "quran",
    labelAr: "القرآن الكريم",
    Icon: BookOpenText,
    href: "/quran",
    size: "full",
    variant: "gold",
    subtitle: "تلاوة وتفسير وتحفيظ — ١١٤ سورة",
  },
  {
    id: "programs",
    labelAr: "البرامج الإسلامية",
    Icon: Tv,
    href: "/programs",
    size: "full",
    variant: "blue",
    subtitle: "٥٠ برنامج — تفسير وفتاوى وسيرة",
  },
  {
    id: "journey30",
    labelAr: "رحلة التوبة ٣٠ يوماً",
    Icon: Route,
    href: "/journey",
    size: "full",
    variant: "purple",
    subtitle: "برنامج تدريجي يومي للتوبة والاستقامة",
  },
  {
    id: "adhkar",
    labelAr: "الأذكار والأدعية",
    Icon: Sparkles,
    href: "/adhkar",
    size: "full",
    variant: "emerald",
    subtitle: "٢٨ قسماً — صباح ومساء وصلاة وحياة",
  },
  {
    id: "sos",
    labelAr: "نداء الاستغاثة",
    Icon: AlertTriangle,
    href: "/sos",
    size: "full",
    variant: "danger",
    subtitle: "لحظة ضعف؟ اضغط الآن",
  },
];

const VARIANT_STYLES = {
  emerald: {
    light: { bg: "#E8F8F2", border: "rgba(16,185,129,0.18)", icon: "#10B981", iconBg: "rgba(16,185,129,0.14)", text: "#065F46" },
    dark: { bg: "#0A1F18", border: "rgba(16,185,129,0.22)", icon: "#34D399", iconBg: "rgba(16,185,129,0.15)", text: "#A7F3D0" },
  },
  gold: {
    light: { bg: "#FDF6E8", border: "rgba(200,150,62,0.18)", icon: "#C8963E", iconBg: "rgba(200,150,62,0.12)", text: "#7C5917" },
    dark: { bg: "#1A1206", border: "rgba(245,158,11,0.22)", icon: "#F59E0B", iconBg: "rgba(245,158,11,0.14)", text: "#FCD34D" },
  },
  amber: {
    light: { bg: "#FFFBEB", border: "rgba(217,119,6,0.18)", icon: "#D97706", iconBg: "rgba(217,119,6,0.12)", text: "#92400E" },
    dark: { bg: "#1A1200", border: "rgba(251,191,36,0.22)", icon: "#FCD34D", iconBg: "rgba(251,191,36,0.14)", text: "#FDE68A" },
  },
  danger: {
    light: { bg: "#FFF1F0", border: "rgba(220,38,38,0.16)", icon: "#DC2626", iconBg: "rgba(220,38,38,0.10)", text: "#991B1B" },
    dark: { bg: "#1A0A0A", border: "rgba(239,68,68,0.22)", icon: "#EF4444", iconBg: "rgba(239,68,68,0.14)", text: "#FCA5A5" },
  },
  purple: {
    light: { bg: "#F5F0FF", border: "rgba(109,40,217,0.14)", icon: "#7C3AED", iconBg: "rgba(109,40,217,0.10)", text: "#5B21B6" },
    dark: { bg: "#120A1A", border: "rgba(167,139,250,0.22)", icon: "#A78BFA", iconBg: "rgba(167,139,250,0.14)", text: "#DDD6FE" },
  },
  blue: {
    light: { bg: "#EFF6FF", border: "rgba(37,99,235,0.14)", icon: "#2563EB", iconBg: "rgba(37,99,235,0.10)", text: "#1E40AF" },
    dark: { bg: "#080F1A", border: "rgba(96,165,250,0.22)", icon: "#60A5FA", iconBg: "rgba(96,165,250,0.14)", text: "#BFDBFE" },
  },
  cyan: {
    light: { bg: "#ECFEFF", border: "rgba(6,182,212,0.16)", icon: "#0891B2", iconBg: "rgba(6,182,212,0.10)", text: "#155E75" },
    dark: { bg: "#030F14", border: "rgba(34,211,238,0.20)", icon: "#22D3EE", iconBg: "rgba(34,211,238,0.12)", text: "#A5F3FC" },
  },
  neutral: {
    light: { bg: "#FAFAF8", border: "rgba(0,0,0,0.07)", icon: "#2D6A4F", iconBg: "rgba(45,106,79,0.08)", text: "#374151" },
    dark: { bg: "#141414", border: "rgba(255,255,255,0.08)", icon: "#10B981", iconBg: "rgba(16,185,129,0.10)", text: "#D1D5DB" },
  },
};

// ── Single BentoCard component ────────────────────────────────────────────────
function BentoCard({
  card,
  isDark,
  isRTL,
  width,
}: {
  card: BentoCard;
  isDark: boolean;
  isRTL: boolean;
  width: number;
}) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const vs = VARIANT_STYLES[card.variant][isDark ? "dark" : "light"];
  const Icon = card.Icon;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { width }]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 20, stiffness: 400 });
        }}
        onPress={() => {
          router.push(card.href as any);
        }}
        style={{
          borderRadius: 22,
          borderWidth: 1,
          padding: card.size === "full" ? 18 : 14,
          backgroundColor: isDark ? "rgba(20,20,20,0.92)" : "rgba(255,255,255,0.94)",
          borderColor: vs.border,
          minHeight: card.size === "full" ? 88 : 110,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.3 : 0.07,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        {/* Background tint */}
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: vs.bg,
            borderRadius: 22,
            opacity: 0.55,
          }}
        />

        {card.size === "full" ? (
          // ── Full-width horizontal layout ──────────────────────────────────
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: vs.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={24} color={vs.icon} />
            </View>
            <View
              style={{
                flex: 1,
                alignItems: isRTL ? "flex-end" : "flex-start",
              }}
            >
              <View
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: vs.text,
                    fontFamily: "IBMPlexSansArabic_700Bold",
                  }}
                >
                  {card.labelAr}
                </Text>
                {card.badge && (
                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 8,
                      backgroundColor: vs.iconBg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "800",
                        color: vs.icon,
                        fontFamily: "IBMPlexSansArabic_700Bold",
                      }}
                    >
                      {card.badge}
                    </Text>
                  </View>
                )}
              </View>
              {card.subtitle && (
                <Text
                  style={{
                    fontSize: 11,
                    color: vs.text,
                    opacity: 0.62,
                    marginTop: 3,
                    fontFamily: "IBMPlexSansArabic_400Regular",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {card.subtitle}
                </Text>
              )}
            </View>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                backgroundColor: vs.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 14, color: vs.icon }}>›</Text>
            </View>
          </View>
        ) : (
          // ── Half-width vertical layout ────────────────────────────────────
          <View
            style={{
              alignItems: isRTL ? "flex-end" : "flex-start",
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                backgroundColor: vs.iconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={19} color={vs.icon} />
            </View>
            <View
              style={{
                marginTop: "auto",
                paddingTop: 10,
                alignItems: isRTL ? "flex-end" : "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: vs.text,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                {card.labelAr}
              </Text>
              {card.subtitle && (
                <Text
                  style={{
                    fontSize: 10,
                    color: vs.text,
                    opacity: 0.58,
                    marginTop: 2,
                    fontFamily: "IBMPlexSansArabic_400Regular",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {card.subtitle}
                </Text>
              )}
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  subtitle,
  isDark,
  isRTL,
  c,
}: {
  title: string;
  subtitle: string;
  isDark: boolean;
  isRTL: boolean;
  c: any;
}) {
  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
      }}
    >
      <View
        style={{
          width: 3,
          height: 18,
          borderRadius: 2,
          backgroundColor: c.primary,
        }}
      />
      <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "800",
            color: c.text,
            fontFamily: "IBMPlexSansArabic_700Bold",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
            marginTop: 1,
            fontFamily: "IBMPlexSansArabic_400Regular",
          }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

// ── Main BentoGrid component ──────────────────────────────────────────────────
export function BentoGrid() {
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";
  const fullW = SW - PAD * 2;

  const renderHalfPair = (a: BentoCard, b: BentoCard, key: string) => (
    <View
      key={key}
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: GAP,
        marginBottom: GAP,
      }}
    >
      <BentoCard card={a} isDark={isDark} isRTL={isRTL} width={COL2} />
      <BentoCard card={b} isDark={isDark} isRTL={isRTL} width={COL2} />
    </View>
  );

  const renderFull = (card: BentoCard) => (
    <View key={card.id} style={{ marginBottom: GAP }}>
      <BentoCard card={card} isDark={isDark} isRTL={isRTL} width={fullW} />
    </View>
  );

  return (
    <View style={{ paddingHorizontal: PAD }}>
      {/* ── Section 1: أدواتك اليومية ── */}
      <SectionHeader
        title="أدواتك اليومية"
        subtitle="ذكر • صلاة • إشعارات • كفارات"
        isDark={isDark}
        isRTL={isRTL}
        c={c}
      />

      {renderHalfPair(DAILY_CARDS[0]!, DAILY_CARDS[1]!, "row-dhikr-prayer")}
      {renderHalfPair(DAILY_CARDS[2]!, DAILY_CARDS[3]!, "row-notif-settings")}
      {renderHalfPair(DAILY_CARDS[4]!, DAILY_CARDS[5]!, "row-kaffarah-rajaa")}
      {renderHalfPair(DAILY_CARDS[6]!, DAILY_CARDS[7]!, "row-journal-hadi")}

      <View style={{ height: 8 }} />

      {/* ── Section 2: رحلتك الروحية ── */}
      <SectionHeader
        title="رحلتك الروحية"
        subtitle="الزكي • القرآن • التوبة • البرامج"
        isDark={isDark}
        isRTL={isRTL}
        c={c}
      />

      {GROWTH_CARDS.map(renderFull)}
    </View>
  );
}
