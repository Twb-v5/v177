import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface TajweedRule {
  id: string;
  emoji: string;
  nameAr: string;
  definition: string;
  example: string;
  tip: string;
  color: string;
}

const RULES: TajweedRule[] = [
  {
    id: "nun-sakin",
    emoji: "ن",
    nameAr: "أحكام النون الساكنة والتنوين",
    definition: "النون الساكنة أو التنوين تتأثر بالحرف الذي يليها بأربعة أحكام: إظهار، إدغام، إقلاب، إخفاء.",
    example: "مَن يَعمل — من بَعد — مِن وَاجِد",
    tip: "تذكّر: إظهار حلقي عند الحروف الحلقية (ء ه ع ح غ خ).",
    color: "#10b981",
  },
  {
    id: "idgham",
    emoji: "دغ",
    nameAr: "الإدغام",
    definition: "إدخال حرف ساكن في حرف متحرك بعده حتى يصيرا حرفاً واحداً مشدداً.",
    example: "مَن يَشاء → مَيَّشاء",
    tip: "الإدغام بغنة: (ي ن م و) — وبدون غنة: (ل ر).",
    color: "#3b82f6",
  },
  {
    id: "iqlab",
    emoji: "ق",
    nameAr: "الإقلاب",
    definition: "قلب النون الساكنة أو التنوين ميماً عند حرف الباء، مع إخفاء الميم وإبقاء الغنة.",
    example: "مِن بَعد → مِمبَعد",
    tip: "الإقلاب لحرف واحد فقط: الباء.",
    color: "#a78bfa",
  },
  {
    id: "ikhfa",
    emoji: "خف",
    nameAr: "الإخفاء",
    definition: "النطق بالحرف الساكن في مرتبة بين الإظهار والإدغام مع بقاء الغنة.",
    example: "مِن تَحتِها",
    tip: "الإخفاء عند 15 حرفاً ما بقي من أحرف اللغة بعد حروف الإظهار والإدغام والإقلاب.",
    color: "#f59e0b",
  },
  {
    id: "madd",
    emoji: "مد",
    nameAr: "المدود",
    definition: "إطالة الصوت بحرف من حروف المد (الألف والواو والياء) أكثر من حركة واحدة.",
    example: "قَالَ — يَقُولُ — قِيلَ",
    tip: "المد الطبيعي: حركتان. المد المتصل: 4-5 حركات. المد المنفصل: 2-4 حركات.",
    color: "#ef4444",
  },
  {
    id: "qalqala",
    emoji: "قق",
    nameAr: "القلقلة",
    definition: "اضطراب الصوت عند النطق بالحرف الساكن حتى يُسمع له نبرة قوية.",
    example: "أَقطَعَ — قَد — طَب",
    tip: "حروف القلقلة: (ق ط ب ج د) — اجمعها في «قطب جد».",
    color: "#06b6d4",
  },
  {
    id: "tafkhim",
    emoji: "تف",
    nameAr: "التفخيم والترقيق",
    definition: "التفخيم: تسمين الحرف وتغليظه. الترقيق: ترقيق الحرف وتنحيفه.",
    example: "اللهُ — الرَّحمن — الصَّلاة",
    tip: "حروف الاستعلاء السبعة دائماً مفخّمة: (خ ص ض ط ظ غ ق) — اجمعها في «خص ضغط قظ».",
    color: "#f97316",
  },
  {
    id: "waqf",
    emoji: "وق",
    nameAr: "الوقف والابتداء",
    definition: "الوقف: قطع الصوت عن الكلمة آخر زمن مناسب. الابتداء: الشروع في القراءة بعد الوقف.",
    example: "۞ — ۩ — ۞",
    tip: "علامة الوقف الجائز: (ج) — وقف لازم: (م) — لا يوقف: (لا).",
    color: "#8b5cf6",
  },
];

function RuleCard({ rule, isRTL, isDark, c, delay }: { rule: TajweedRule; isRTL: boolean; isDark: boolean; c: any; delay: number }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded(v => !v);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ marginBottom: 10 }}>
      <Pressable onPress={toggle} style={{
        borderRadius: 18,
        backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "#fff",
        borderWidth: 1.5,
        borderColor: expanded ? `${rule.color}50` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
        overflow: "hidden",
      }}>
        {expanded && <View style={{ position: "absolute", inset: 0, backgroundColor: `${rule.color}08` }} />}

        {/* Header */}
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", padding: 16, gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${rule.color}18`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${rule.color}30` }}>
            <Text style={{ fontSize: 16, fontWeight: "900", color: rule.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{rule.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>
              {rule.nameAr}
            </Text>
          </View>
          {expanded ? <ChevronUp size={18} color={c.textMuted} /> : <ChevronDown size={18} color={c.textMuted} />}
        </View>

        {/* Body */}
        {expanded && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />

            <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 24, marginBottom: 14 }}>
              {rule.definition}
            </Text>

            <View style={{ backgroundColor: `${rule.color}12`, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: `${rule.color}25` }}>
              <Text style={{ fontSize: 11, color: rule.color, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", marginBottom: 6 }}>مثال:</Text>
              <Text style={{ fontSize: 16, color: c.text, fontFamily: "Amiri_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 30 }}>
                {rule.example}
              </Text>
            </View>

            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8, alignItems: "flex-start" }}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Text style={{ flex: 1, fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 20 }}>
                {rule.tip}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function TajweedScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader titleAr="أحكام التجويد" subtitleAr="تعلّم أحكام تلاوة القرآن الكريم" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }}>

          {/* Intro Banner */}
          <Animated.View entering={FadeInDown.delay(40).springify()} style={{ borderRadius: 20, padding: 18, marginBottom: 20, backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)", borderWidth: 1.5, borderColor: "rgba(16,185,129,0.25)", overflow: "hidden" }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <BookOpen size={18} color="#10b981" />
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                تعلّم التجويد
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "Amiri_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 26 }}>
              «اقرأ القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه» — رواه مسلم
            </Text>
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 8 }}>
              اضغط على كل حكم لقراءة تفاصيله ومثاله وطريقة تطبيقه
            </Text>
          </Animated.View>

          {/* Rules */}
          {RULES.map((rule, i) => (
            <RuleCard key={rule.id} rule={rule} isRTL={isRTL} isDark={isDark} c={c} delay={60 + i * 40} />
          ))}

          {/* Practice CTA */}
          <Animated.View entering={FadeInDown.delay(420).springify()} style={{ borderRadius: 20, padding: 18, marginTop: 10, backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "#fff", borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", alignItems: "center" }}>
            <Text style={{ fontSize: 28, marginBottom: 10 }}>📖</Text>
            <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 8 }}>
              طبّق ما تعلّمته
            </Text>
            <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 20 }}>
              انتقل لقارئ القرآن وطبّق أحكام التجويد على ما تتلوه
            </Text>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
