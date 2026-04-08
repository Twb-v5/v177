import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AlertTriangle, CheckCircle2, Circle, ChevronDown, ChevronUp, Shield } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface DangerSign {
  id: string;
  emoji: string;
  titleAr: string;
  descAr: string;
  solutionAr: string;
  severity: "warning" | "danger" | "critical";
}

const DANGER_SIGNS: DangerSign[] = [
  {
    id: "s1", emoji: "📱", severity: "warning",
    titleAr: "التصفح الوحيد في الليل",
    descAr: "البقاء وحيداً مع الهاتف في وقت متأخر من الليل يفتح أبواباً خطيرة.",
    solutionAr: "ضع الهاتف خارج غرفة النوم. اقرأ آية الكرسي واستعذ بالله.",
  },
  {
    id: "s2", emoji: "😮‍💨", severity: "warning",
    titleAr: "الفراغ والملل الشديد",
    descAr: "النفس الفارغة تبحث عن ملء، وكثيراً ما تجد الحرام قبل الحلال.",
    solutionAr: "احفظ 3 أنشطة نافعة في هاتفك: قرآن، تمرين، مكالمة صديق.",
  },
  {
    id: "s3", emoji: "🌙", severity: "warning",
    titleAr: "تأخير الصلاة أو تركها",
    descAr: "الصلاة هي الحصن الأول. إهمالها علامة تراجع روحي خطير.",
    solutionAr: "فعّل تنبيهات الصلاة. صلِّ حتى لو كانت قضاءً — ابدأ الآن.",
  },
  {
    id: "s4", emoji: "💭", severity: "danger",
    titleAr: "الخواطر الآثمة المتكررة",
    descAr: "تكرار الخواطر يسبق الفعل. الوسواس يبدأ صغيراً ثم يتضخم.",
    solutionAr: "بمجرد ظهور الخاطر: استعذ، انهض، غيّر المكان أو النشاط فوراً.",
  },
  {
    id: "s5", emoji: "🔒", severity: "danger",
    titleAr: "الخلوة بالمحرمات",
    descAr: "تواجد في أماكن أو فتح مواقع تعرف أنها تقودك للفتنة.",
    solutionAr: "ثبّت فلتر الإنترنت. فعّل وضع القفل على التطبيقات الخطرة.",
  },
  {
    id: "s6", emoji: "📉", severity: "danger",
    titleAr: "تناقص الذكر والأذكار",
    descAr: "قلة الذكر تُضعف الحاجز بينك وبين المعصية بشكل تدريجي.",
    solutionAr: "عُد لأذكار الصباح والمساء اليوم. ابدأ بـ3 دقائق فقط.",
  },
  {
    id: "s7", emoji: "🆘", severity: "critical",
    titleAr: "الشعور بأن التوبة مستحيلة",
    descAr: "هذا وسواس الشيطان — «لا تقنط من رحمة الله». هذا الإحساس نفسه فخ.",
    solutionAr: "اذهب لصفحة 'لحظة سقوط' الآن. تحدث مع شخص تثق به.",
  },
  {
    id: "s8", emoji: "😤", severity: "critical",
    titleAr: "العزلة التامة والانطواء",
    descAr: "الوحدة الكاملة تضعف عزيمتك. الإنسان اجتماعي بطبعه وبالفطرة.",
    solutionAr: "تواصل مع إنسان واحد الآن — رسالة، مكالمة، أي شيء.",
  },
];

const SEVERITY_CONFIG = {
  warning:  { color: "#F59E0B", bgColor: "rgba(245,158,11,0.1)",  labelAr: "تحذير",   icon: "⚠️" },
  danger:   { color: "#F97316", bgColor: "rgba(249,115,22,0.1)",  labelAr: "خطر",     icon: "🔶" },
  critical: { color: "#ef4444", bgColor: "rgba(239,68,68,0.1)",   labelAr: "حرج",     icon: "🔴" },
};

function SignCard({ sign, isChecked, isRTL, isDark, c, onToggle }: {
  sign: DangerSign; isChecked: boolean; isRTL: boolean; isDark: boolean; c: any; onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const sev = SEVERITY_CONFIG[sign.severity];

  return (
    <Animated.View style={[animStyle, { marginBottom: 8 }]}>
      <View style={{ borderRadius: 18, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1,
        borderColor: isChecked ? "rgba(16,185,129,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"), overflow: "hidden" }}>
        <View style={{ height: 2, backgroundColor: isChecked ? "#10b981" : sev.color }} />

        <Pressable
          onPressIn={() => { scale.value = withSpring(0.99); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          onPress={() => { setExpanded(e => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14 }}>
          <Text style={{ fontSize: 22 }}>{sign.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: sev.bgColor }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: sev.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{sev.labelAr}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{sign.titleAr}</Text>
          </View>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
            <Pressable onPress={() => { onToggle(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
              {isChecked ? <CheckCircle2 size={22} color="#10b981" /> : <Circle size={22} color={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"} />}
            </Pressable>
            {expanded ? <ChevronUp size={16} color={c.textMuted} /> : <ChevronDown size={16} color={c.textMuted} />}
          </View>
        </Pressable>

        {expanded && (
          <Animated.View entering={FadeInDown.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 22, marginBottom: 10 }}>
              {sign.descAr}
            </Text>
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.07)", borderWidth: 1, borderColor: "rgba(16,185,129,0.18)" }}>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Shield size={12} color="#10b981" />
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>الحل الفوري</Text>
              </View>
              <Text style={{ fontSize: 13, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 22 }}>
                {sign.solutionAr}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default function SignsScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [checkedSigns, setCheckedSigns] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "warning" | "danger" | "critical">("all");

  const toggleSign = (id: string) => {
    setCheckedSigns(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const filtered = filter === "all" ? DANGER_SIGNS : DANGER_SIGNS.filter(s => s.severity === filter);
  const criticalCount = DANGER_SIGNS.filter(s => s.severity === "critical" && checkedSigns.has(s.id)).length;

  const FILTERS: Array<{ id: "all" | "warning" | "danger" | "critical"; labelAr: string; color: string }> = [
    { id: "all",      labelAr: "الكل",     color: c.textSecondary },
    { id: "warning",  labelAr: "تحذير",    color: "#F59E0B" },
    { id: "danger",   labelAr: "خطر",      color: "#F97316" },
    { id: "critical", labelAr: "حرج",      color: "#ef4444" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="علامات الخطر" subtitleAr="تعرّف على مؤشرات الانتكاسة مبكراً" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, borderRadius: 18, marginBottom: 16, backgroundColor: isDark ? "rgba(239,68,68,0.06)" : "#FFF1F0", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={18} color="#ef4444" />
            <Text style={{ flex: 1, fontSize: 13, color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", fontWeight: "700" }}>
              راقب هذه العلامات — التشخيص المبكر يُنقذ
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 8, textAlign: isRTL ? "right" : "left", lineHeight: 20 }}>
            علّم ✓ على العلامة إذا تحققت عندك اليوم، وستظهر لك الحلول الفورية
          </Text>
        </View>

        {criticalCount > 0 && (
          <Animated.View entering={FadeInDown.duration(300)} style={{ padding: 16, borderRadius: 18, marginBottom: 16, backgroundColor: "rgba(239,68,68,0.1)", borderWidth: 1.5, borderColor: "rgba(239,68,68,0.3)" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center" }}>
              ⚠️ لديك {criticalCount} علامة حرجة — تصرف الآن
            </Text>
            <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 4 }}>
              انتقل لصفحة الطوارئ أو تواصل مع شخص تثق به
            </Text>
          </Animated.View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8, marginBottom: 14 }}>
          {FILTERS.map(f => (
            <Pressable key={f.id} onPress={() => { setFilter(f.id); Haptics.selectionAsync(); }}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                backgroundColor: filter === f.id ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                borderWidth: 1, borderColor: filter === f.id ? f.color + "60" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)") }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: filter === f.id ? f.color : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{f.labelAr}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((sign, i) => (
          <Animated.View key={sign.id} entering={FadeInDown.delay(i < 6 ? i * 40 : 0).springify()}>
            <SignCard sign={sign} isChecked={checkedSigns.has(sign.id)} isRTL={isRTL} isDark={isDark} c={c} onToggle={() => toggleSign(sign.id)} />
          </Animated.View>
        ))}

        <View style={{ padding: 18, borderRadius: 20, marginTop: 8, backgroundColor: isDark ? "rgba(16,185,129,0.05)" : "#F0FDF4", borderWidth: 1, borderColor: "rgba(16,185,129,0.15)" }}>
          <Text style={{ fontSize: 15, fontFamily: "Amiri_400Regular", color: c.text, textAlign: "center", lineHeight: 32 }}>
            «وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ»
          </Text>
          <Text style={{ fontSize: 11, color: "#10b981", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 6 }}>الذاريات: ٥٥</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
