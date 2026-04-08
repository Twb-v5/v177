import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckSquare, Square, Flame, Trophy, Star, Zap } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const STORAGE_KEY = "habits_daily_v1";

type HabitLevel = "easy" | "medium" | "advanced";

interface HabitInfo {
  key: string;
  nameAr: string;
  level: HabitLevel;
  icon: string;
  timing: string;
  reason: string;
}

const HABITS_LIBRARY: HabitInfo[] = [
  { key: "wudu",           nameAr: "الوضوء قبل النوم",             level: "easy",     icon: "💧", timing: "قبل النوم",       reason: "يُبقيك على طهارة وتُصبح في حراسة الملائكة" },
  { key: "bismillah",      nameAr: "البسملة قبل كل عمل",            level: "easy",     icon: "✨", timing: "طوال اليوم",     reason: "تجعل أعمالك العادية عبادة مبروكة" },
  { key: "quran_page",     nameAr: "قراءة صفحة من القرآن",          level: "easy",     icon: "📗", timing: "بعد الفجر",       reason: "صفحة يومياً = ختمة كل سنتين" },
  { key: "morning_azkar",  nameAr: "أذكار الصباح المختصرة",          level: "easy",     icon: "🌅", timing: "بعد الفجر",       reason: "حصن يوميٌّ يبدأ بذِكر الله" },
  { key: "evening_azkar",  nameAr: "أذكار المساء المختصرة",          level: "easy",     icon: "🌆", timing: "بعد العصر",       reason: "إغلاق يومك بالذكر يُهدّئ القلب" },
  { key: "no_haram_look",  nameAr: "غض البصر طوال اليوم",            level: "easy",     icon: "👁️", timing: "طوال اليوم",     reason: "الغضّ يُورث نوراً في القلب" },
  { key: "ayah_kursi",     nameAr: "آية الكرسي قبل النوم",           level: "easy",     icon: "🌙", timing: "قبل النوم",       reason: "من قرأها لا يقربه شيطان حتى الصباح" },
  { key: "smile_sadaqa",   nameAr: "الابتسامة في وجه المسلم",        level: "easy",     icon: "😊", timing: "طوال اليوم",     reason: "«تبسّمك في وجه أخيك صدقة»" },
  { key: "istighfar_100",  nameAr: "ورد الاستغفار 100 مرة يومياً",   level: "medium",   icon: "🌿", timing: "في أي وقت",       reason: "«من لزم الاستغفار جعل الله له من كل ضيق مخرجاً»" },
  { key: "witr",           nameAr: "صلاة الوتر قبل النوم",           level: "medium",   icon: "🌙", timing: "قبل النوم",       reason: "وصية النبي ﷺ التي لم يتركها" },
  { key: "rawatib",        nameAr: "السنن الرواتب الـ12",            level: "medium",   icon: "🕌", timing: "مع كل صلاة",      reason: "«بنى الله له بيتاً في الجنة»" },
  { key: "duha",           nameAr: "صلاة الضحى (ركعتان)",            level: "medium",   icon: "☀️", timing: "ضحىً",            reason: "كفارة عن كل مفصل في جسدك" },
  { key: "sadaqa_daily",   nameAr: "الصدقة اليومية ولو درهماً",      level: "medium",   icon: "💰", timing: "في أي وقت",       reason: "«الصدقة تطفئ الخطيئة»" },
  { key: "parents_dua",    nameAr: "الدعاء للوالدين بعد كل صلاة",   level: "medium",   icon: "❤️", timing: "بعد كل صلاة",     reason: "صلتك بهم بعد مماتهم" },
  { key: "tahajjud",       nameAr: "ركعتا تهجد في آخر الليل",       level: "advanced", icon: "🌟", timing: "آخر الليل",       reason: "أقرب ما يكون العبد من ربه في جوف الليل" },
  { key: "fasting_week",   nameAr: "صيام الاثنين والخميس",           level: "advanced", icon: "📅", timing: "الاثنين والخميس", reason: "«تُعرض الأعمال فأحب أن يُعرض عملي وأنا صائم»" },
  { key: "memorize_ayah",  nameAr: "حفظ آية كريمة جديدة يومياً",    level: "advanced", icon: "🧠", timing: "بعد الفجر",       reason: "بيتٌ شُيِّد في صدرك لا يُهدم" },
  { key: "no_sin_day",     nameAr: "يوم كامل خالٍ من الذنوب",       level: "advanced", icon: "🏆", timing: "طوال اليوم",     reason: "هذا هو الهدف الحقيقي" },
];

const LEVEL_CONFIG: Record<HabitLevel, { labelAr: string; color: string; bg: string }> = {
  easy:     { labelAr: "سهل",   color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  medium:   { labelAr: "متوسط", color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  advanced: { labelAr: "متقدم", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)"  },
};

function HabitCard({ habit, isCompleted, isRTL, isDark, c, onToggle }: { habit: HabitInfo; isCompleted: boolean; isRTL: boolean; isDark: boolean; c: any; onToggle: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const lvl = LEVEL_CONFIG[habit.level];

  return (
    <Animated.View style={[animStyle, { marginBottom: 8 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onToggle}
        style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16,
          backgroundColor: isCompleted ? (isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)") : (isDark ? "rgba(14,14,14,0.92)" : "#fff"),
          borderWidth: 1.5, borderColor: isCompleted ? "rgba(16,185,129,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)") }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center",
          backgroundColor: isCompleted ? "rgba(16,185,129,0.15)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
          borderWidth: 1, borderColor: isCompleted ? "rgba(16,185,129,0.25)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
          <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{habit.nameAr}</Text>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8, marginTop: 3 }}>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: lvl.bg }}>
              <Text style={{ fontSize: 9, fontWeight: "700", color: lvl.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{lvl.labelAr}</Text>
            </View>
            <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{habit.timing}</Text>
          </View>
        </View>
        {isCompleted ? (
          <CheckSquare size={22} color="#10b981" />
        ) : (
          <Square size={22} color={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const today = new Date().toISOString().slice(0, 10);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | HabitLevel>("all");

  useEffect(() => {
    AsyncStorage.getItem(`${STORAGE_KEY}_${today}`).then(raw => {
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    });
  }, []);

  const toggle = async (key: string) => {
    const updated = new Set(completed);
    if (updated.has(key)) {
      updated.delete(key);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      updated.add(key);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCompleted(updated);
    await AsyncStorage.setItem(`${STORAGE_KEY}_${today}`, JSON.stringify(Array.from(updated)));
  };

  const filtered = filter === "all" ? HABITS_LIBRARY : HABITS_LIBRARY.filter(h => h.level === filter);
  const completedToday = HABITS_LIBRARY.filter(h => completed.has(h.key)).length;
  const totalPct = (completedToday / HABITS_LIBRARY.length) * 100;

  const LEVEL_FILTERS: Array<{ id: "all" | HabitLevel; labelAr: string }> = [
    { id: "all",      labelAr: "الكل"   },
    { id: "easy",     labelAr: "سهل"    },
    { id: "medium",   labelAr: "متوسط"  },
    { id: "advanced", labelAr: "متقدم"  },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="العادات اليومية" subtitleAr={`${completedToday} / ${HABITS_LIBRARY.length} مكتملة`} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ borderRadius: 20, padding: 18, marginBottom: 16, backgroundColor: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.25)" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>إنجاز اليوم</Text>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6 }}>
              <Flame size={16} color="#F59E0B" />
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>{completedToday}</Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(16,185,129,0.15)", overflow: "hidden" }}>
            <View style={{ height: "100%", borderRadius: 8, backgroundColor: "#10b981", width: `${totalPct}%` }} />
          </View>
          <Text style={{ fontSize: 11, color: "#10b981", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6, textAlign: isRTL ? "right" : "left" }}>
            {Math.round(totalPct)}% من عاداتك اليومية
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8, marginBottom: 16 }}>
          {LEVEL_FILTERS.map(lf => (
            <Pressable key={lf.id} onPress={() => { setFilter(lf.id); Haptics.selectionAsync(); }}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                backgroundColor: filter === lf.id ? (isDark ? c.primary : "#2D6A4F") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                borderWidth: 1, borderColor: filter === lf.id ? "transparent" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: filter === lf.id ? "#fff" : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{lf.labelAr}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.map((habit, i) => (
          <Animated.View key={habit.key} entering={FadeInDown.delay(i < 8 ? i * 30 : 0).springify()}>
            <HabitCard habit={habit} isCompleted={completed.has(habit.key)} isRTL={isRTL} isDark={isDark} c={c} onToggle={() => toggle(habit.key)} />
          </Animated.View>
        ))}

        {completedToday >= 5 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ padding: 18, borderRadius: 20, alignItems: "center", marginTop: 8, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.22)" }}>
            <Trophy size={28} color="#F59E0B" />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 8 }}>
              {completedToday >= HABITS_LIBRARY.length ? "أحسنت! أتممت كل عاداتك 🎉" : `أحسنت! أكملت ${completedToday} عادة`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
