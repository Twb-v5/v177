import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CheckSquare, Square, Flame, Trophy, RefreshCw } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

type HabitLevel = "easy" | "medium" | "advanced";

interface ApiHabit {
  id: number;
  sessionId: string;
  habitKey: string;
  habitNameAr: string;
  completed: boolean;
  date: string;
}

const HABIT_META: Record<string, { icon: string; level: HabitLevel; timing: string; reason: string }> = {
  wudu:           { icon: "💧", level: "easy",     timing: "قبل النوم",       reason: "يُبقيك على طهارة وتُصبح في حراسة الملائكة" },
  bismillah:      { icon: "✨", level: "easy",     timing: "طوال اليوم",     reason: "تجعل أعمالك العادية عبادة مبروكة" },
  quran_page:     { icon: "📗", level: "easy",     timing: "بعد الفجر",       reason: "صفحة يومياً = ختمة كل سنتين" },
  morning_azkar:  { icon: "🌅", level: "easy",     timing: "بعد الفجر",       reason: "حصن يوميٌّ يبدأ بذِكر الله" },
  evening_azkar:  { icon: "🌆", level: "easy",     timing: "بعد العصر",       reason: "إغلاق يومك بالذكر يُهدّئ القلب" },
  no_haram_look:  { icon: "👁️", level: "easy",     timing: "طوال اليوم",     reason: "الغضّ يُورث نوراً في القلب" },
  ayah_kursi:     { icon: "🌙", level: "easy",     timing: "قبل النوم",       reason: "من قرأها لا يقربه شيطان حتى الصباح" },
  smile_sadaqa:   { icon: "😊", level: "easy",     timing: "طوال اليوم",     reason: "«تبسّمك في وجه أخيك صدقة»" },
  istighfar_10:   { icon: "🌿", level: "easy",     timing: "بعد الصلاة",      reason: "سنة النبي ﷺ بعد كل صلاة" },
  istighfar_100:  { icon: "🌿", level: "medium",   timing: "في أي وقت",       reason: "«من لزم الاستغفار جعل الله له من كل ضيق مخرجاً»" },
  witr:           { icon: "🌙", level: "medium",   timing: "قبل النوم",       reason: "وصية النبي ﷺ التي لم يتركها" },
  rawatib:        { icon: "🕌", level: "medium",   timing: "مع كل صلاة",      reason: "«بنى الله له بيتاً في الجنة»" },
  duha:           { icon: "☀️", level: "medium",   timing: "ضحىً",            reason: "كفارة عن كل مفصل في جسدك" },
  sadaqa_daily:   { icon: "💰", level: "medium",   timing: "في أي وقت",       reason: "«الصدقة تطفئ الخطيئة»" },
  parents_dua:    { icon: "❤️", level: "medium",   timing: "بعد كل صلاة",     reason: "صلتك بهم بعد مماتهم" },
  sayyid_morning: { icon: "🌟", level: "medium",   timing: "الصباح",          reason: "سيد الاستغفار — أفضل الاستغفار" },
  sayyid_evening: { icon: "🌙", level: "medium",   timing: "المساء",          reason: "سيد الاستغفار — أفضل الاستغفار" },
  tahajjud:       { icon: "🌟", level: "advanced", timing: "آخر الليل",       reason: "أقرب ما يكون العبد من ربه في جوف الليل" },
  fasting_week:   { icon: "📅", level: "advanced", timing: "الاثنين والخميس", reason: "«تُعرض الأعمال فأحب أن يُعرض عملي وأنا صائم»" },
  memorize_ayah:  { icon: "🧠", level: "advanced", timing: "بعد الفجر",       reason: "بيتٌ شُيِّد في صدرك لا يُهدم" },
  no_sin_day:     { icon: "🏆", level: "advanced", timing: "طوال اليوم",     reason: "هذا هو الهدف الحقيقي" },
  istighfar_1000: { icon: "📿", level: "advanced", timing: "طوال اليوم",     reason: "العبد الشاكر يذكر الله كثيراً" },
  quran_hizb:     { icon: "📖", level: "advanced", timing: "بعد الفجر",       reason: "ثلث القرآن كل شهر" },
  journal_tawbah: { icon: "📓", level: "medium",   timing: "قبل النوم",       reason: "المحاسبة اليومية طريق الصالحين" },
};

const LEVEL_CONFIG: Record<HabitLevel, { labelAr: string; color: string; bg: string }> = {
  easy:     { labelAr: "سهل",   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  medium:   { labelAr: "متوسط", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  advanced: { labelAr: "متقدم", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
};

function HabitCard({ habit, meta, isCompleted, isRTL, isDark, c, onToggle, loading }: {
  habit: ApiHabit; meta: typeof HABIT_META[string]; isCompleted: boolean;
  isRTL: boolean; isDark: boolean; c: ReturnType<typeof useColors>;
  onToggle: () => void; loading: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const lvl = LEVEL_CONFIG[meta?.level ?? "easy"];

  return (
    <Animated.View style={[animStyle, { marginBottom: 8 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onToggle}
        disabled={loading}
        style={{
          flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16,
          backgroundColor: isCompleted ? (isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)") : (isDark ? "rgba(14,14,14,0.92)" : "#fff"),
          borderWidth: 1.5, borderColor: isCompleted ? "rgba(16,185,129,0.3)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
          opacity: loading ? 0.6 : 1,
        }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center",
          backgroundColor: isCompleted ? "rgba(16,185,129,0.15)" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
          borderWidth: 1, borderColor: isCompleted ? "rgba(16,185,129,0.25)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
          <Text style={{ fontSize: 20 }}>{meta?.icon ?? "✓"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{habit.habitNameAr}</Text>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8, marginTop: 3 }}>
            {lvl && (
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: lvl.bg }}>
                <Text style={{ fontSize: 9, fontWeight: "700", color: lvl.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{lvl.labelAr}</Text>
              </View>
            )}
            {meta?.timing && <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{meta.timing}</Text>}
          </View>
        </View>
        {isCompleted ? <CheckSquare size={22} color="#10b981" /> : <Square size={22} color={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"} />}
      </Pressable>
    </Animated.View>
  );
}

export default function HabitsScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [habits, setHabits] = useState<ApiHabit[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [initialLoading, setInitialLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | HabitLevel>("all");

  const today = new Date().toISOString().slice(0, 10);

  const fetchHabits = useCallback(async () => {
    setInitialLoading(true);
    try {
      const sid = getSessionId();
      const res = await fetch(apiUrl(`/habits?sessionId=${encodeURIComponent(sid)}&date=${today}`));
      if (res.ok) {
        const data = await res.json() as ApiHabit[];
        setHabits(data);
      }
    } catch (e) {
      console.error("Habits fetch error:", e);
    } finally {
      setInitialLoading(false);
    }
  }, [today]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const toggle = async (habit: ApiHabit) => {
    const newCompleted = !habit.completed;
    Haptics.impactAsync(newCompleted ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completed: newCompleted } : h));
    setLoadingIds(prev => new Set(prev).add(habit.id));
    try {
      const sid = getSessionId();
      const res = await fetch(apiUrl("/habits"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, habitKey: habit.habitKey, completed: newCompleted }),
      });
      if (!res.ok) {
        setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completed: habit.completed } : h));
      }
    } catch {
      setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, completed: habit.completed } : h));
    } finally {
      setLoadingIds(prev => { const s = new Set(prev); s.delete(habit.id); return s; });
    }
  };

  const filtered = filter === "all" ? habits : habits.filter(h => (HABIT_META[h.habitKey]?.level ?? "easy") === filter);
  const completedToday = habits.filter(h => h.completed).length;
  const totalPct = habits.length > 0 ? (completedToday / habits.length) * 100 : 0;

  const LEVEL_FILTERS: Array<{ id: "all" | HabitLevel; labelAr: string }> = [
    { id: "all", labelAr: "الكل" }, { id: "easy", labelAr: "سهل" },
    { id: "medium", labelAr: "متوسط" }, { id: "advanced", labelAr: "متقدم" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="العادات اليومية"
        subtitleAr={initialLoading ? "جاري التحميل..." : `${completedToday} / ${habits.length} مكتملة`}
        rightAction={
          <Pressable onPress={fetchHabits} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={16} color={c.textSecondary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
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

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8, marginBottom: 16 }}>
          {LEVEL_FILTERS.map(lf => (
            <Pressable key={lf.id} onPress={() => { setFilter(lf.id); Haptics.selectionAsync(); }}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: filter === lf.id ? (isDark ? c.primary : "#2D6A4F") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), borderWidth: 1, borderColor: filter === lf.id ? "transparent" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: filter === lf.id ? "#fff" : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{lf.labelAr}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {initialLoading ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 12 }}>جاري تحميل عاداتك...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 6 }}>لا توجد عادات</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>أكمل خطوة من رحلتك أولاً</Text>
          </View>
        ) : (
          filtered.map((habit, i) => (
            <Animated.View key={habit.id} entering={FadeInDown.delay(i < 8 ? i * 30 : 0).springify()}>
              <HabitCard
                habit={habit}
                meta={HABIT_META[habit.habitKey] ?? { icon: "✓", level: "easy", timing: "", reason: "" }}
                isCompleted={habit.completed}
                isRTL={isRTL} isDark={isDark} c={c}
                onToggle={() => toggle(habit)}
                loading={loadingIds.has(habit.id)}
              />
            </Animated.View>
          ))
        )}

        {completedToday >= 5 && !initialLoading && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ padding: 18, borderRadius: 20, alignItems: "center", marginTop: 8, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.22)" }}>
            <Trophy size={28} color="#F59E0B" />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 8 }}>
              {completedToday >= habits.length ? "أحسنت! أتممت كل عاداتك 🎉" : `أحسنت! أكملت ${completedToday} عادة`}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
