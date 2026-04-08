import { useState } from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Heart, Shield, RefreshCw, ArrowRight, Phone } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const STEPS = [
  {
    id: "1", emoji: "💧", titleAr: "لا تيأس من رحمة الله",
    descAr: "الوقوع في الذنب مؤلم لكنه لا يعني نهايتك. الله يفرح بتوبتك أكثر مما تتصور.",
    verseAr: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    verseRef: "الزمر: ٥٣", accentColor: "#60A5FA",
  },
  {
    id: "2", emoji: "🤲", titleAr: "تب الآن — الآن وليس غداً",
    descAr: "التوبة لا تحتاج استعداداً طويلاً. قل «أستغفر الله وأتوب إليه» بصدق من قلبك.",
    verseAr: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ",
    verseRef: "البقرة: ٢٢٢", accentColor: "#10b981",
  },
  {
    id: "3", emoji: "🌊", titleAr: "اغتسل وتوضأ",
    descAr: "الطهارة الجسدية تُعين على الطهارة الروحية. الوضوء يُذهب الوسواس ويُصفي النفس.",
    verseAr: "وَاللَّهُ يُحِبُّ الْمُطَّهِّرِينَ",
    verseRef: "التوبة: ١٠٨", accentColor: "#8B5CF6",
  },
  {
    id: "4", emoji: "🕌", titleAr: "صلِّ ركعتي التوبة",
    descAr: "«ما من عبد يذنب ذنباً ثم يقوم فيتطهر ويصلي ركعتين ثم يستغفر الله إلا غُفر له»",
    verseAr: "وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ",
    verseRef: "آل عمران: ١٣٥", accentColor: "#F59E0B",
  },
  {
    id: "5", emoji: "🛡️", titleAr: "حلّل ما حدث واتخذ إجراءً",
    descAr: "ما الذي قادك لهذا؟ وحدة؟ ملل؟ فراغ؟ ضع خطوة عملية واحدة لتجنبه المرة القادمة.",
    verseAr: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ",
    verseRef: "الحشر: ١٨", accentColor: "#ef4444",
  },
];

const EMERGENCY_LINES = [
  { label: "خط مساندة - السعودية", number: "920033360", flag: "🇸🇦" },
  { label: "خط نجدة - مصر", number: "16000", flag: "🇪🇬" },
  { label: "خط الدعم النفسي - المغرب", number: "0801003030", flag: "🇲🇦" },
];

export default function RelapseScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [currentStep, setCurrentStep] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);
  const [breatheActive, setBreatheActive] = useState(false);

  const breatheScale = useSharedValue(1);

  const startBreathe = () => {
    setBreatheActive(true);
    breatheScale.value = withSequence(
      withTiming(1.4, { duration: 4000 }),
      withTiming(1, { duration: 4000 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: breatheScale.value }] }));

  const step = STEPS[currentStep];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="لحظة سقوط" subtitleAr="الله معك في هذه اللحظة" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={{ borderRadius: 22, padding: 20, marginBottom: 18, alignItems: "center",
          backgroundColor: isDark ? "rgba(96,165,250,0.07)" : "#EFF6FF", borderWidth: 1, borderColor: "rgba(96,165,250,0.25)" }}>
          <Text style={{ fontSize: 14, color: "#60A5FA", fontFamily: "Amiri_400Regular", textAlign: "center", lineHeight: 28, marginBottom: 4 }}>
            «وَمَن يَعْمَلْ سُوءًا أَوْ يَظْلِمْ نَفْسَهُ ثُمَّ يَسْتَغْفِرِ اللَّهَ يَجِدِ اللَّهَ غَفُورًا رَّحِيمًا»
          </Text>
          <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>النساء: ١١٠</Text>
        </View>

        <View style={{ borderRadius: 22, overflow: "hidden", marginBottom: 18,
          backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "#fff", borderWidth: 1.5, borderColor: step ? `${step.accentColor}35` : "rgba(255,255,255,0.08)" }}>
          {step && <View style={{ height: 4, backgroundColor: step.accentColor }} />}
          {step && (
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: `${step.accentColor}15`, borderWidth: 1, borderColor: `${step.accentColor}25`, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 24 }}>{step.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: step.accentColor, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>الخطوة {currentStep + 1} من {STEPS.length}</Text>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{step.titleAr}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 24, marginBottom: 14 }}>
                {step.descAr}
              </Text>

              <View style={{ padding: 14, borderRadius: 14, backgroundColor: `${step.accentColor}09`, borderWidth: 1, borderColor: `${step.accentColor}20`, marginBottom: 16 }}>
                <Text style={{ fontSize: 15, fontFamily: "Amiri_400Regular", color: c.text, textAlign: "center", lineHeight: 30 }}>{step.verseAr}</Text>
                <Text style={{ fontSize: 11, color: step.accentColor, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 6 }}>{step.verseRef}</Text>
              </View>

              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
                {currentStep > 0 && (
                  <Pressable onPress={() => setCurrentStep(s => s - 1)}
                    style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                    <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>السابق</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => { if (currentStep < STEPS.length - 1) { setCurrentStep(s => s + 1); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: step.accentColor }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                    {currentStep < STEPS.length - 1 ? "الخطوة التالية →" : "✓ بدأت رحلة التعافي"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 18 }}>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Pressable key={i} onPress={() => setCurrentStep(i)}
              style={{ flex: 1, height: 6, borderRadius: 6, backgroundColor: i <= currentStep ? (STEPS[i]?.accentColor ?? "#10b981") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") }} />
          ))}
        </View>

        <View style={{ borderRadius: 20, overflow: "hidden", marginBottom: 18, backgroundColor: isDark ? "rgba(139,92,246,0.06)" : "#F5F3FF", borderWidth: 1, borderColor: "rgba(139,92,246,0.18)", padding: 20, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 8 }}>تنفس ببطء</Text>
          <Animated.View style={[breatheStyle, { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(139,92,246,0.2)", borderWidth: 2, borderColor: "rgba(139,92,246,0.4)", alignItems: "center", justifyContent: "center", marginBottom: 12 }]}>
            <Text style={{ fontSize: 32 }}>🫁</Text>
          </Animated.View>
          <Pressable onPress={startBreathe}
            style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: "rgba(139,92,246,0.14)", borderWidth: 1, borderColor: "rgba(139,92,246,0.25)" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#8B5CF6", fontFamily: "IBMPlexSansArabic_700Bold" }}>ابدأ التنفس (4 ثوانٍ)</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => { setShowEmergency(!showEmergency); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ borderRadius: 20, padding: 16, marginBottom: 10, backgroundColor: isDark ? "rgba(239,68,68,0.07)" : "#FFF1F0", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
            <Phone size={18} color="#ef4444" />
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold" }}>خطوط الطوارئ</Text>
          </View>
          <ArrowRight size={16} color="#ef4444" />
        </Pressable>

        {showEmergency && (
          <Animated.View entering={FadeIn.duration(200)}>
            {EMERGENCY_LINES.map((line, i) => (
              <Pressable key={i} onPress={() => Linking.openURL(`tel:${line.number}`)}
                style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, marginBottom: 8,
                  backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                <Text style={{ fontSize: 22 }}>{line.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{line.label}</Text>
                  <Text style={{ fontSize: 12, color: "#60A5FA", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>{line.number}</Text>
                </View>
                <Phone size={16} color="#60A5FA" />
              </Pressable>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
