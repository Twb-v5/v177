import { useEffect, useState, useRef } from "react";
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
  Easing,
} from "react-native-reanimated";
import { ChevronRight, ChevronLeft, BookOpen, Heart, Wind, ArrowRight, ChevronDown } from "lucide-react-native";

type Phase = "alert" | "breathing" | "duas";

const BREATH_CYCLE_MS = 8000;

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
  {
    label: "دعاء الفرج",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ",
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

function BreathingCircle({ isDark }: { isDark: boolean }) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0.6);
  const [breathLabel, setBreathLabel] = useState<"استنشق" | "احبس" | "ازفر">("استنشق");

  useEffect(() => {
    const runCycle = () => {
      setBreathLabel("استنشق");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(1, { duration: 4000 });

      setTimeout(() => {
        setBreathLabel("احبس");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 4000);

      setTimeout(() => {
        setBreathLabel("ازفر");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) });
        opacity.value = withTiming(0.6, { duration: 4000 });
      }, 5500);
    };

    runCycle();
    const interval = setInterval(runCycle, BREATH_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ alignItems: "center", justifyContent: "center", height: 240 }}>
      <Animated.View
        style={[
          {
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: isDark ? "rgba(45,106,79,0.25)" : "rgba(45,106,79,0.15)",
            borderWidth: 3,
            borderColor: isDark ? "rgba(52,211,153,0.6)" : "rgba(45,106,79,0.6)",
            alignItems: "center",
            justifyContent: "center",
          },
          circleStyle,
        ]}
      >
        <Text style={{ fontSize: 26, marginBottom: 4 }}>🌬️</Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: isDark ? "#34D399" : "#2D6A4F",
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: "center",
          }}
        >
          {breathLabel}
        </Text>
      </Animated.View>
    </View>
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

function PhaseIndicator({ phase, c }: { phase: Phase; c: ReturnType<typeof useColors> }) {
  const phases: { key: Phase; label: string; emoji: string }[] = [
    { key: "alert", label: "استغاثة", emoji: "🆘" },
    { key: "breathing", label: "تنفس", emoji: "🌬️" },
    { key: "duas", label: "أدعية", emoji: "🤲" },
  ];

  return (
    <View style={{ flexDirection: "row-reverse", gap: 8, paddingHorizontal: 16, paddingBottom: 12 }}>
      {phases.map((p, idx) => {
        const active = p.key === phase;
        const done = phases.findIndex((x) => x.key === phase) > idx;
        return (
          <View key={p.key} style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: done
                  ? "#2D6A4F"
                  : active
                    ? (c.isDark ? "#1A0A0A" : "#FEE2E2")
                    : (c.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                borderWidth: 2,
                borderColor: done ? "#2D6A4F" : active ? "#DC2626" : (c.isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 16 }}>{done ? "✓" : p.emoji}</Text>
            </View>
            <Text style={{ fontSize: 10, color: active ? c.text : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {p.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SOSScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";
  const [phase, setPhase] = useState<Phase>("alert");
  const [breathCount, setBreathCount] = useState(0);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  useEffect(() => {
    if (phase === "breathing") {
      let count = 0;
      breathRef.current = setInterval(() => {
        count++;
        setBreathCount(count);
        if (count >= 3) {
          clearInterval(breathRef.current!);
          setTimeout(() => setPhase("duas"), 1000);
        }
      }, BREATH_CYCLE_MS);
      return () => clearInterval(breathRef.current!);
    }
  }, [phase]);

  const steps = [
    {
      icon: <Wind size={22} color="#2563EB" />,
      titleAr: "١. تنفس بعمق",
      descAr: "خذ ثلاثة أنفاس عميقة وبطيئة. جسدك بأمان الآن.",
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

      <PhaseIndicator phase={phase} c={c} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* PHASE 1: ALERT */}
        {phase === "alert" && (
          <>
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

            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14, fontWeight: "800", color: c.text,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                  textAlign: "right", marginBottom: 12,
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

            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setPhase("breathing"); }}
                style={{
                  padding: 18, borderRadius: 18, alignItems: "center",
                  backgroundColor: isDark ? "#0A1F14" : "#2D6A4F",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#FFFFFF", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  ابدأ تمرين التنفس 🌬️
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 4 }}>
                  ثلاث دورات تنفس عميق
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* PHASE 2: BREATHING */}
        {phase === "breathing" && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ alignItems: "center", paddingTop: 20, paddingBottom: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center" }}>
                تمرين التنفس العميق
              </Text>
              <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6, textAlign: "center" }}>
                اتبع الدائرة — ٤ ثوان استنشاق، ١.٥ ثانية حبس، ٤ ثوان زفير
              </Text>
            </View>

            <BreathingCircle isDark={isDark} />

            <View style={{ flexDirection: "row-reverse", justifyContent: "center", gap: 8, marginBottom: 20 }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 12, height: 12, borderRadius: 6,
                    backgroundColor: breathCount > i
                      ? "#2D6A4F"
                      : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"),
                  }}
                />
              ))}
            </View>

            <Text style={{ textAlign: "center", color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", fontSize: 13 }}>
              {breathCount < 3 ? `دورة ${breathCount + 1} من ٣` : "أحسنت! 🌟"}
            </Text>

            <Pressable
              onPress={() => setPhase("duas")}
              style={{
                marginTop: 24, padding: 16, borderRadius: 16, alignItems: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              }}
            >
              <Text style={{ color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", fontSize: 13 }}>
                تخطي إلى الأدعية
              </Text>
            </Pressable>
          </View>
        )}

        {/* PHASE 3: DUAS */}
        {phase === "duas" && (
          <>
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <Text style={{ fontSize: 40 }}>🤲</Text>
              <Text
                style={{
                  fontSize: 18, fontWeight: "800", color: c.text,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                  marginTop: 12, textAlign: "center",
                }}
              >
                الآن تضرع إلى الله
              </Text>
              <Text
                style={{
                  fontSize: 13, color: c.textSecondary,
                  fontFamily: "IBMPlexSansArabic_400Regular",
                  textAlign: "center", marginTop: 6, paddingHorizontal: 32, lineHeight: 20,
                }}
              >
                اضغط على أي دعاء للتثبيت في قلبك
              </Text>
            </View>

            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14, fontWeight: "800", color: c.text,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                  textAlign: "right", marginBottom: 12,
                }}
              >
                أدعية الكرب والفرج
              </Text>
              {DUAS.map((d) => (
                <DuaCard key={d.label} arabic={d.arabic} label={d.label} isDark={isDark} c={c} />
              ))}
            </View>

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

              <Pressable
                onPress={() => setPhase("alert")}
                style={{
                  padding: 14, borderRadius: 16, alignItems: "center",
                  backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                }}
              >
                <Text style={{ color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", fontSize: 12 }}>
                  العودة للبداية
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
