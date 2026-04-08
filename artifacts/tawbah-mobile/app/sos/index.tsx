import { useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { ChevronRight, ChevronLeft, BookOpen, Heart, Wind, ArrowRight } from "lucide-react-native";

const DUAS = [
  {
    label: "دعاء الكرب",
    arabic:
      "اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنتَ",
  },
  { label: "حسبنا الله", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ" },
  {
    label: "دعاء يونس عليه السلام",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
  },
];

function PulseRing({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1400 }), withTiming(1, { duration: 1400 })),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 1400 }), withTiming(0.6, { duration: 1400 })),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 90,
          height: 90,
          borderRadius: 45,
          borderWidth: 2,
          borderColor: color,
        },
        animStyle,
      ]}
    />
  );
}

function DuaCard({
  arabic,
  label,
  isDark,
  c,
}: {
  arabic: string;
  label: string;
  isDark: boolean;
  c: ReturnType<typeof useColors>;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20, stiffness: 400 });
        }}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={{
          padding: 18,
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: c.textMuted,
            fontFamily: "IBMPlexSansArabic_700Bold",
            marginBottom: 8,
            textAlign: "right",
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: c.text,
            fontFamily: "Amiri_400Regular",
            textAlign: "center",
            lineHeight: 34,
          }}
        >
          {arabic}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function SOSScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const steps = [
    {
      icon: <Wind size={22} color="#2563EB" />,
      titleAr: "١. تنفس بعمق",
      descAr: "خذ ثلاثة أنفاس عميقة وبطيئة. تذكر أن جسدك بأمان الآن.",
      color: "#2563EB",
      bg: isDark ? "#080F1A" : "#EFF6FF",
      border: isDark ? "rgba(96,165,250,0.18)" : "rgba(37,99,235,0.12)",
    },
    {
      icon: <BookOpen size={22} color="#7C3AED" />,
      titleAr: "٢. اقرأ هذه الأدعية",
      descAr: "ردد دعاء الكرب وتوسل إلى الله بضعفك وحاجتك إليه.",
      color: "#7C3AED",
      bg: isDark ? "#120A1A" : "#F5F0FF",
      border: isDark ? "rgba(167,139,250,0.18)" : "rgba(109,40,217,0.12)",
    },
    {
      icon: <Heart size={22} color="#DB2777" />,
      titleAr: "٣. تذكر رحمة الله",
      descAr: "الله يحب التوابين، وبابه مفتوح أمامك الآن. لا تيأس.",
      color: "#DB2777",
      bg: isDark ? "#1A0A14" : "#FDF0F8",
      border: isDark ? "rgba(244,114,182,0.18)" : "rgba(219,39,119,0.12)",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.divider,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {isRTL
            ? <ChevronRight size={20} color={c.textSecondary} />
            : <ChevronLeft size={20} color={c.textSecondary} />}
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#DC2626", fontFamily: "IBMPlexSansArabic_700Bold" }}>
            🆘 نداء الاستغاثة
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero Pulse */}
        <View style={{ alignItems: "center", paddingVertical: 36 }}>
          <View style={{ alignItems: "center", justifyContent: "center", width: 90, height: 90 }}>
            <PulseRing color="#DC2626" />
            <View
              style={{
                width: 78, height: 78, borderRadius: 39,
                backgroundColor: isDark ? "#1A0A0A" : "#FEE2E2",
                alignItems: "center", justifyContent: "center",
                borderWidth: 2, borderColor: "#DC2626",
              }}
            >
              <Text style={{ fontSize: 30 }}>🤲</Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 20, fontWeight: "800", color: c.text,
              fontFamily: "IBMPlexSansArabic_700Bold",
              marginTop: 22, textAlign: "center",
            }}
          >
            أنت بأمان، الله معك
          </Text>
          <Text
            style={{
              fontSize: 14, color: c.textSecondary,
              fontFamily: "IBMPlexSansArabic_400Regular",
              textAlign: "center", marginTop: 8,
              paddingHorizontal: 32, lineHeight: 22,
            }}
          >
            لا تحارب وحدك — اتبع هذه الخطوات الآن
          </Text>
        </View>

        {/* Steps */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14, fontWeight: "800", color: c.text,
              fontFamily: "IBMPlexSansArabic_700Bold",
              textAlign: isRTL ? "right" : "left", marginBottom: 12,
            }}
          >
            خطوات الإسعاف الروحي
          </Text>
          {steps.map((s) => (
            <View
              key={s.titleAr}
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                gap: 14, padding: 16, borderRadius: 18,
                backgroundColor: s.bg, marginBottom: 10,
                borderWidth: 1, borderColor: s.border,
              }}
            >
              <View
                style={{
                  width: 42, height: 42, borderRadius: 14,
                  backgroundColor: s.color + "18",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                {s.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14, fontWeight: "800", color: c.text,
                    fontFamily: "IBMPlexSansArabic_700Bold",
                    textAlign: isRTL ? "right" : "left", marginBottom: 4,
                  }}
                >
                  {s.titleAr}
                </Text>
                <Text
                  style={{
                    fontSize: 13, color: c.textSecondary,
                    fontFamily: "IBMPlexSansArabic_400Regular",
                    textAlign: isRTL ? "right" : "left", lineHeight: 20,
                  }}
                >
                  {s.descAr}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Duas */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14, fontWeight: "800", color: c.text,
              fontFamily: "IBMPlexSansArabic_700Bold",
              textAlign: isRTL ? "right" : "left", marginBottom: 12,
            }}
          >
            أدعية الكرب والفرج
          </Text>
          {DUAS.map((d) => (
            <DuaCard key={d.label} arabic={d.arabic} label={d.label} isDark={isDark} c={c} />
          ))}
        </View>

        {/* CTA links */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Pressable
            onPress={() => router.push("/covenant" as any)}
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center", justifyContent: "space-between",
              padding: 16, borderRadius: 18,
              backgroundColor: isDark ? "#0A1F14" : "#E8F5EE",
              borderWidth: 1,
              borderColor: isDark ? "rgba(16,185,129,0.18)" : "rgba(45,106,79,0.16)",
            }}
          >
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 22 }}>📜</Text>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  جدد ميثاقك مع الله
                </Text>
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  لا يزال الباب مفتوحاً
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={c.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => router.push("/zakiy" as any)}
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center", justifyContent: "space-between",
              padding: 16, borderRadius: 18,
              backgroundColor: isDark ? "#120A1A" : "#F5F0FF",
              borderWidth: 1,
              borderColor: isDark ? "rgba(167,139,250,0.18)" : "rgba(109,40,217,0.12)",
            }}
          >
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 22 }}>✨</Text>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  تحدث مع زكيّ الآن
                </Text>
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  مرشدك الروحي الذكي
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={c.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
