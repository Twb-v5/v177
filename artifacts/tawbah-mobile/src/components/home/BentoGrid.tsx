import { View, Text, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import {
  BookOpenText, Clock, Repeat, Sparkles, Brain,
  Shield, Route, NotebookPen, Users, Layers,
  AlertTriangle, Heart, Moon, Star,
} from "lucide-react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const GAP = 10;
const COL2 = (SW - PAD * 2 - GAP) / 2;
const COL3 = (SW - PAD * 2 - GAP * 2) / 3;

interface BentoCard {
  id: string;
  labelAr: string;
  labelEn: string;
  Icon: any;
  href: string;
  size: "half" | "full" | "third" | "twoThird";
  variant: "emerald" | "gold" | "danger" | "purple" | "blue" | "neutral";
  badge?: string;
  subtitle?: string;
}

const BENTO_CARDS: BentoCard[] = [
  {
    id: "sos",
    labelAr: "نداء الاستغاثة",
    labelEn: "SOS · تعثرت؟",
    Icon: AlertTriangle,
    href: "/sos",
    size: "half",
    variant: "danger",
    subtitle: "لحظة ضعف؟ اضغط الآن",
  },
  {
    id: "zakiy",
    labelAr: "زكي AI",
    labelEn: "Zakiy · رفيقك الروحي",
    Icon: Brain,
    href: "/zakiy",
    size: "half",
    variant: "emerald",
    badge: "AI",
    subtitle: "مرافقك في التوبة",
  },
  {
    id: "daily-covenant",
    labelAr: "العهد اليومي",
    labelEn: "Daily Covenant",
    Icon: Heart,
    href: "/covenant",
    size: "full",
    variant: "gold",
    subtitle: "رتّب يومك وثبّت عهدك مع الله",
  },
  {
    id: "dhikr",
    labelAr: "الذكر",
    labelEn: "Dhikr",
    Icon: Repeat,
    href: "/dhikr",
    size: "third",
    variant: "emerald",
  },
  {
    id: "journey30",
    labelAr: "رحلة ٣٠",
    labelEn: "Journey",
    Icon: Route,
    href: "/journey",
    size: "twoThird",
    variant: "purple",
    subtitle: "يوم ١٢ من ٣٠",
  },
  {
    id: "quran",
    labelAr: "القرآن",
    labelEn: "Quran",
    Icon: BookOpenText,
    href: "/quran",
    size: "half",
    variant: "blue",
  },
  {
    id: "prayer",
    labelAr: "الصلاة",
    labelEn: "Prayer",
    Icon: Clock,
    href: "/prayer-times",
    size: "half",
    variant: "neutral",
  },
  {
    id: "adhkar",
    labelAr: "الأذكار",
    labelEn: "Adhkar",
    Icon: Sparkles,
    href: "/adhkar",
    size: "half",
    variant: "gold",
  },
  {
    id: "journal",
    labelAr: "اليوميات",
    labelEn: "Journal",
    Icon: NotebookPen,
    href: "/journal",
    size: "half",
    variant: "neutral",
  },
];

const VARIANT_STYLES = {
  emerald: {
    light: { bg: "#E8F8F2", border: "rgba(16,185,129,0.18)", icon: "#10B981", iconBg: "rgba(16,185,129,0.14)", text: "#065F46" },
    dark: { bg: "#0A1F18", border: "rgba(16,185,129,0.20)", icon: "#34D399", iconBg: "rgba(16,185,129,0.15)", text: "#A7F3D0" },
  },
  gold: {
    light: { bg: "#FDF6E8", border: "rgba(200,150,62,0.18)", icon: "#C8963E", iconBg: "rgba(200,150,62,0.12)", text: "#7C5917" },
    dark: { bg: "#1A1206", border: "rgba(245,158,11,0.22)", icon: "#F59E0B", iconBg: "rgba(245,158,11,0.14)", text: "#FCD34D" },
  },
  danger: {
    light: { bg: "#FFF1F0", border: "rgba(220,38,38,0.16)", icon: "#DC2626", iconBg: "rgba(220,38,38,0.10)", text: "#991B1B" },
    dark: { bg: "#1A0A0A", border: "rgba(239,68,68,0.22)", icon: "#EF4444", iconBg: "rgba(239,68,68,0.14)", text: "#FCA5A5" },
  },
  purple: {
    light: { bg: "#F5F0FF", border: "rgba(109,40,217,0.14)", icon: "#7C3AED", iconBg: "rgba(109,40,217,0.10)", text: "#5B21B6" },
    dark: { bg: "#120A1A", border: "rgba(167,139,250,0.20)", icon: "#A78BFA", iconBg: "rgba(167,139,250,0.12)", text: "#DDD6FE" },
  },
  blue: {
    light: { bg: "#EFF6FF", border: "rgba(37,99,235,0.14)", icon: "#2563EB", iconBg: "rgba(37,99,235,0.10)", text: "#1E40AF" },
    dark: { bg: "#080F1A", border: "rgba(96,165,250,0.20)", icon: "#60A5FA", iconBg: "rgba(96,165,250,0.12)", text: "#BFDBFE" },
  },
  neutral: {
    light: { bg: "#FAFAF8", border: "rgba(0,0,0,0.07)", icon: "#2D6A4F", iconBg: "rgba(45,106,79,0.08)", text: "#374151" },
    dark: { bg: "#141414", border: "rgba(255,255,255,0.08)", icon: "#10B981", iconBg: "rgba(16,185,129,0.10)", text: "#D1D5DB" },
  },
};

function BentoCard({ card, isDark, isRTL, width }: { card: BentoCard; isDark: boolean; isRTL: boolean; width: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const vs = VARIANT_STYLES[card.variant][isDark ? "dark" : "light"];
  const isFullWidth = card.size === "full";
  const Icon = card.Icon;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { width }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 20, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 20, stiffness: 400 }); }}
        onPress={() => { router.push(card.href as any); }}
        style={[{
          borderRadius: 22,
          borderWidth: 1,
          padding: isFullWidth ? 18 : 14,
          backgroundColor: isDark
            ? "rgba(20,20,20,0.92)"
            : "rgba(255,255,255,0.94)",
          borderColor: vs.border,
          minHeight: isFullWidth ? 88 : card.size === "third" ? 100 : 110,
          overflow: "hidden",
          shadowColor: isDark ? "#000" : "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: isDark ? 0.30 : 0.07,
          shadowRadius: 10,
          elevation: 3,
        }]}
      >
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: vs.bg, borderRadius: 22, opacity: 0.55,
        }} />

        {isFullWidth ? (
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: vs.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Icon size={24} color={vs.icon} />
            </View>
            <View style={{ flex: 1, alignItems: isRTL ? "flex-end" : "flex-start" }}>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: vs.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {card.labelAr}
                </Text>
                {card.badge && (
                  <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: vs.iconBg }}>
                    <Text style={{ fontSize: 9, fontWeight: "800", color: vs.icon, fontFamily: "IBMPlexSansArabic_700Bold" }}>{card.badge}</Text>
                  </View>
                )}
              </View>
              {card.subtitle && (
                <Text style={{ fontSize: 12, color: vs.text, opacity: 0.65, marginTop: 3, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left" }}>
                  {card.subtitle}
                </Text>
              )}
            </View>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: vs.iconBg, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 14, color: vs.icon }}>›</Text>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start", flex: 1 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: vs.iconBg, alignItems: "center", justifyContent: "center" }}>
                <Icon size={19} color={vs.icon} />
              </View>
              {card.badge && (
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: vs.iconBg }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: vs.icon, fontFamily: "IBMPlexSansArabic_700Bold" }}>{card.badge}</Text>
                </View>
              )}
            </View>
            <View style={{ marginTop: "auto", paddingTop: 10, alignItems: isRTL ? "flex-end" : "flex-start" }}>
              <Text style={{ fontSize: card.size === "third" ? 13 : 14, fontWeight: "800", color: vs.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>
                {card.labelAr}
              </Text>
              {card.subtitle && (
                <Text style={{ fontSize: 10, color: vs.text, opacity: 0.60, marginTop: 2, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left" }}>
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

export function BentoGrid() {
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const renderRow = (cards: BentoCard[]) => {
    if (cards.length === 0) return null;
    const card = cards[0];
    const fullW = SW - PAD * 2;

    if (card.size === "full") {
      return (
        <View key={card.id} style={{ marginBottom: GAP }}>
          <BentoCard card={card} isDark={isDark} isRTL={isRTL} width={fullW} />
        </View>
      );
    }

    if (card.size === "half" && cards.length === 2) {
      return (
        <View key={`${card.id}-row`} style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: GAP, marginBottom: GAP }}>
          <BentoCard card={cards[0]} isDark={isDark} isRTL={isRTL} width={COL2} />
          <BentoCard card={cards[1]} isDark={isDark} isRTL={isRTL} width={COL2} />
        </View>
      );
    }

    if (card.size === "third" && cards.length >= 2 && cards[1]?.size === "twoThird") {
      return (
        <View key={`${card.id}-row`} style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: GAP, marginBottom: GAP }}>
          <BentoCard card={cards[0]} isDark={isDark} isRTL={isRTL} width={COL3} />
          <BentoCard card={cards[1]} isDark={isDark} isRTL={isRTL} width={COL3 * 2 + GAP} />
        </View>
      );
    }

    return (
      <View key={card.id} style={{ marginBottom: GAP }}>
        <BentoCard card={card} isDark={isDark} isRTL={isRTL} width={fullW} />
      </View>
    );
  };

  const rows: BentoCard[][] = [
    [BENTO_CARDS[0], BENTO_CARDS[1]],
    [BENTO_CARDS[2]],
    [BENTO_CARDS[3], BENTO_CARDS[4]],
    [BENTO_CARDS[5], BENTO_CARDS[6]],
    [BENTO_CARDS[7], BENTO_CARDS[8]],
  ];

  return (
    <View style={{ paddingHorizontal: PAD }}>
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", marginBottom: 14, gap: 8 }}>
        <View style={{ width: 3, height: 18, borderRadius: 2, backgroundColor: c.isDark ? c.primary : c.primary }} />
        <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
          لوحة التحكم
        </Text>
      </View>
      {rows.map((row, i) => renderRow(row))}
    </View>
  );
}
