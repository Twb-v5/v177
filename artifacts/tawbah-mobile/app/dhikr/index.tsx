import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { FloatingTabBar } from "@/components/home/FloatingTabBar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const CATEGORIES = [
  {
    id: "morning",
    labelAr: "أذكار الصباح",
    emoji: "🌅",
    countAr: "٢١ ذكراً",
    bgLight: "#FDF6E8",
    bgDark: "#1A1206",
    accentLight: "#C8963E",
    accentDark: "#F59E0B",
    borderLight: "rgba(200,150,62,0.18)",
    borderDark: "rgba(245,158,11,0.22)",
  },
  {
    id: "evening",
    labelAr: "أذكار المساء",
    emoji: "🌙",
    countAr: "٢٠ ذكراً",
    bgLight: "#F5F0FF",
    bgDark: "#120A1A",
    accentLight: "#7C3AED",
    accentDark: "#A78BFA",
    borderLight: "rgba(109,40,217,0.14)",
    borderDark: "rgba(167,139,250,0.20)",
  },
  {
    id: "sleep",
    labelAr: "أذكار النوم",
    emoji: "💫",
    countAr: "١١ ذكراً",
    bgLight: "#EFF6FF",
    bgDark: "#080F1A",
    accentLight: "#2563EB",
    accentDark: "#60A5FA",
    borderLight: "rgba(37,99,235,0.14)",
    borderDark: "rgba(96,165,250,0.20)",
  },
  {
    id: "general",
    labelAr: "تسبيح عام",
    emoji: "📿",
    countAr: "بلا حدود",
    bgLight: "#E8F5EE",
    bgDark: "#0A1F18",
    accentLight: "#2D6A4F",
    accentDark: "#34D399",
    borderLight: "rgba(45,106,79,0.18)",
    borderDark: "rgba(52,211,153,0.20)",
  },
  {
    id: "prayer",
    labelAr: "أذكار الصلاة",
    emoji: "🕌",
    countAr: "١٥ ذكراً",
    bgLight: "#FFF1F0",
    bgDark: "#1A0A0A",
    accentLight: "#DC2626",
    accentDark: "#F87171",
    borderLight: "rgba(220,38,38,0.14)",
    borderDark: "rgba(248,113,113,0.20)",
  },
  {
    id: "waking",
    labelAr: "أذكار الاستيقاظ",
    emoji: "☀️",
    countAr: "٦ أذكار",
    bgLight: "#FDF6E8",
    bgDark: "#1A1206",
    accentLight: "#B45309",
    accentDark: "#FCD34D",
    borderLight: "rgba(200,150,62,0.18)",
    borderDark: "rgba(252,211,77,0.20)",
  },
];

const QUICK_DHIKR = [
  { labelAr: "سبحان الله", count: 33 },
  { labelAr: "الحمد لله", count: 33 },
  { labelAr: "الله أكبر", count: 34 },
  { labelAr: "لا إله إلا الله", count: 100 },
  { labelAr: "أستغفر الله", count: 100 },
  { labelAr: "سبحان الله وبحمده", count: 100 },
];

function CategoryCard({
  cat,
  isDark,
  isRTL,
  onPress,
}: {
  cat: (typeof CATEGORIES)[0];
  isDark: boolean;
  isRTL: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg = isDark ? cat.bgDark : cat.bgLight;
  const accent = isDark ? cat.accentDark : cat.accentLight;
  const border = isDark ? cat.borderDark : cat.borderLight;

  return (
    <Animated.View style={[animStyle, { width: "48%" }]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 20, stiffness: 400 });
        }}
        onPress={onPress}
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "rgba(255,255,255,0.92)",
          borderWidth: 1,
          borderColor: border,
          minHeight: 110,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: bg,
            opacity: 0.6,
          }}
        />
        <Text style={{ fontSize: 28, marginBottom: 8 }}>{cat.emoji}</Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "800",
            color: accent,
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {cat.labelAr}
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            fontFamily: "IBMPlexSansArabic_400Regular",
            marginTop: 3,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {cat.countAr}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function DhikrHubScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: c.divider,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: c.text,
              fontFamily: "IBMPlexSansArabic_700Bold",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            الذكر والأدعية
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: c.textMuted,
              fontFamily: "IBMPlexSansArabic_400Regular",
              textAlign: isRTL ? "right" : "left",
              marginTop: 2,
            }}
          >
            {isRTL ? "ذِكْر الله تطمئن القلوب" : "The heart finds rest in the remembrance of Allah"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quranic Verse Hero */}
          <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
            <View
              style={{
                borderRadius: 24,
                padding: 22,
                overflow: "hidden",
                backgroundColor: isDark ? "#0A1F14" : "#2D6A4F",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  opacity: 0.12,
                  backgroundColor: isDark ? "#10B981" : "#ffffff",
                }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#ffffff",
                  fontFamily: "Amiri_400Regular",
                  textAlign: "center",
                  lineHeight: 38,
                  marginBottom: 10,
                }}
              >
                أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.65)",
                  textAlign: "center",
                  fontFamily: "IBMPlexSansArabic_400Regular",
                }}
              >
                الرعد: ٢٨
              </Text>
            </View>
          </View>

          {/* Quick Tasbih */}
          <View style={{ marginBottom: 22 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: c.text,
                fontFamily: "IBMPlexSansArabic_700Bold",
                textAlign: isRTL ? "right" : "left",
                marginBottom: 10,
                paddingHorizontal: 16,
              }}
            >
              التسبيح السريع
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: 10,
                paddingHorizontal: 16,
              }}
            >
              {QUICK_DHIKR.map((d) => (
                <Pressable
                  key={d.labelAr}
                  onPress={() =>
                    router.push({
                      pathname: "/dhikr/counter",
                      params: { arabic: d.labelAr, count: d.count, category: "general" },
                    } as any)
                  }
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: isDark
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(45,106,79,0.07)",
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(16,185,129,0.18)"
                      : "rgba(45,106,79,0.14)",
                    alignItems: "center",
                    minWidth: 100,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: c.primary,
                      fontFamily: "Amiri_400Regular",
                    }}
                  >
                    {d.labelAr}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: c.textMuted,
                      fontFamily: "IBMPlexSansArabic_400Regular",
                      marginTop: 3,
                    }}
                  >
                    × {d.count}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Categories Grid */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "800",
                color: c.text,
                fontFamily: "IBMPlexSansArabic_700Bold",
                textAlign: isRTL ? "right" : "left",
                marginBottom: 12,
              }}
            >
              الأذكار المأثورة
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  isDark={isDark}
                  isRTL={isRTL}
                  onPress={() =>
                    router.push({
                      pathname: "/dhikr/counter",
                      params: { category: cat.id },
                    } as any)
                  }
                />
              ))}
            </View>
          </View>

          {/* Virtue Card */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View
              style={{
                borderRadius: 18,
                padding: 18,
                backgroundColor: isDark ? "rgba(16,16,16,0.8)" : "rgba(255,255,255,0.85)",
                borderWidth: 1,
                borderColor: c.divider,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: c.text,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                  textAlign: isRTL ? "right" : "left",
                  marginBottom: 8,
                }}
              >
                فضل الذكر
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: c.textSecondary,
                  fontFamily: "IBMPlexSansArabic_400Regular",
                  lineHeight: 22,
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                بذكر الله تطمئن القلوب، وتُمحى الذنوب، وتُرفع الدرجات. قال
                صلى الله عليه وسلم: «أحبُّ الكلامِ إلى اللهِ أربعٌ: سبحانَ
                اللهِ، والحمدُ للهِ، ولا إلهَ إلا اللهُ، واللهُ أكبرُ»
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <FloatingTabBar />
    </View>
  );
}
